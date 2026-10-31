/** A failure, in words, under whatever failed. Renders nothing when there is none. */
export const ErrorText = ({ error }: { error: unknown }) => (error ? <p className="text-sm text-destructive">{(error as Error).message}</p> : null);
