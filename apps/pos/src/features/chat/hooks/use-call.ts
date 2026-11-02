import type { Channel } from 'phoenix';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchIceServers } from '@/core/api';

export type CallState =
  | { status: 'idle' }
  | { status: 'ringing'; video: boolean; incoming: boolean; callId: string; from?: string }
  | { status: 'connected'; video: boolean; callId: string };

type Signal = { call_id: string; description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };

/**
 * One-to-one WebRTC call over a conversation channel. Media goes peer to peer;
 * the channel only carries invite/accept/end and the SDP/ICE exchange.
 */
export function useCall(channel: Channel | null, token: string) {
  const [state, setState] = useState<CallState>({ status: 'idle' });
  const [local, setLocal] = useState<MediaStream | null>(null);
  const [remote, setRemote] = useState<MediaStream | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const callId = useRef<string | null>(null);
  // ICE candidates can arrive before the remote description is set.
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const cleanup = useCallback(() => {
    pc.current?.close();
    pc.current = null;
    callId.current = null;
    pendingCandidates.current = [];
    setLocal((s) => (s?.getTracks().forEach((t) => t.stop()), null));
    setRemote(null);
    setState({ status: 'idle' });
  }, []);

  const createPeer = useCallback(
    async (video: boolean, id: string) => {
      const ice = await fetchIceServers(token).catch(() => []);
      const peer = new RTCPeerConnection({ iceServers: ice });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      stream.getTracks().forEach((t) => peer.addTrack(t, stream));
      setLocal(stream);
      const incoming = new MediaStream();
      peer.ontrack = (e) => {
        e.streams[0]?.getTracks().forEach((t) => incoming.addTrack(t));
        setRemote(incoming);
      };
      peer.onicecandidate = (e) => {
        if (e.candidate) channel?.push('call:signal', { call_id: id, candidate: e.candidate.toJSON() });
      };
      peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected') setState({ status: 'connected', video, callId: id });
        if (peer.connectionState === 'failed') cleanup();
      };
      pc.current = peer;
      return peer;
    },
    [channel, token, cleanup],
  );

  // Caller: invite, then wait for accept before sending the offer.
  const start = useCallback(
    (video: boolean) => {
      channel?.push('call:invite', { video }).receive('ok', (r: { call_id: string }) => {
        callId.current = r.call_id;
        setState({ status: 'ringing', video, incoming: false, callId: r.call_id });
      });
    },
    [channel],
  );

  const accept = useCallback(async () => {
    if (state.status !== 'ringing' || !state.incoming) return;
    callId.current = state.callId;
    await createPeer(state.video, state.callId);
    channel?.push('call:accept', { call_id: state.callId });
  }, [state, channel, createPeer]);

  const hangup = useCallback(() => {
    if (callId.current) channel?.push(state.status === 'ringing' && state.incoming ? 'call:reject' : 'call:end', { call_id: callId.current });
    cleanup();
  }, [channel, state, cleanup]);

  useEffect(() => {
    if (!channel) return;
    const refs = [
      channel.on('call:incoming', (m: { call_id: string; video: boolean; from: { name?: string } }) => {
        if (callId.current) {
          channel.push('call:reject', { call_id: m.call_id }); // already busy
          return;
        }
        setState({ status: 'ringing', video: m.video, incoming: true, callId: m.call_id, from: m.from.name });
      }),
      channel.on('call:accepted', async (m: Signal) => {
        if (m.call_id !== callId.current) return;
        const video = state.status === 'ringing' ? state.video : false;
        const peer = await createPeer(video, m.call_id);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        channel.push('call:signal', { call_id: m.call_id, description: offer });
      }),
      channel.on('call:signal', async (m: Signal) => {
        const peer = pc.current;
        if (!peer || m.call_id !== callId.current) return;
        if (m.description) {
          await peer.setRemoteDescription(m.description);
          for (const c of pendingCandidates.current.splice(0)) await peer.addIceCandidate(c);
          if (m.description.type === 'offer') {
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            channel.push('call:signal', { call_id: m.call_id, description: answer });
          }
        } else if (m.candidate) {
          if (peer.remoteDescription) await peer.addIceCandidate(m.candidate);
          else pendingCandidates.current.push(m.candidate);
        }
      }),
      channel.on('call:rejected', cleanup),
      channel.on('call:ended', cleanup),
    ];
    return () => refs.forEach((ref, i) => channel.off(['call:incoming', 'call:accepted', 'call:signal', 'call:rejected', 'call:ended'][i]!, ref));
  }, [channel, createPeer, cleanup, state]);

  useEffect(() => cleanup, [cleanup]);

  return { state, local, remote, start, accept, hangup };
}
