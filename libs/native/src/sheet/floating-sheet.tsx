import React, { memo, useCallback, type ReactNode, type Ref } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';

/** The thin gap between the floating card and the screen's edges, the same on every side. */
export const SHEET_GAP = 12;

/** As round as the screen's own corner (about 55pt on the iPhone 17 Pro). */
export const SHEET_RADIUS = 48;

export type FloatingSheetProps = {
  /** Opens the sheet with `ref.current?.present()`. */
  ref?: Ref<BottomSheetModal>;
  /**
   * What stays on top while the body scrolls (a title and a description, usually). It is drawn in the sheet's handle, under
   * the grab bar, with a line below it, so it never scrolls away. It pads itself.
   */
  header?: ReactNode;
  /** The body. It scrolls when it is taller than `maxHeightShare` of the screen; the sheet is as tall as it needs otherwise. */
  children: ReactNode;
  /** Gap to the screen's edges. */
  gap?: number;
  radius?: number;
  backgroundColor?: string;
  /** The edge of the card and the line under the header. */
  borderColor?: string;
  /** The grab bar. */
  handleColor?: string;
  /** How much of the screen's height the card may take before the body scrolls. */
  maxHeightShare?: number;
  /** Called once the sheet is closed, by any means. */
  onDismiss?: () => void;
  /** Called once the sheet has finished opening. */
  onShow?: () => void;
};

const renderBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
);

/**
 * A bottom sheet that floats as a card, a thin gap from the screen's edges and round on every side, with a header fixed on
 * top and a body that scrolls. Flat: a thin edge and no shadow. The colours default to the apps' neutral palette; an app
 * passes its theme's if it differs.
 */
export const FloatingSheet = memo((props: FloatingSheetProps) => {
  const {
    ref,
    header,
    children,
    gap = SHEET_GAP,
    radius = SHEET_RADIUS,
    backgroundColor = '#FAFAFA',
    borderColor = '#EEEEEE',
    handleColor = '#EEEEEE',
    maxHeightShare = 0.7,
    onDismiss,
    onShow,
  } = props;
  const { height } = useWindowDimensions();

  // In the handle, because the handle is the one part of a sheet that does not scroll with its body.
  const renderHandle = useCallback(
    (handleProps: BottomSheetHandleProps) => (
      <BottomSheetHandle
        {...handleProps}
        indicatorStyle={{ backgroundColor: handleColor }}
        style={styles.handle}
      >
        {header ? <View style={[styles.header, { borderBottomColor: borderColor }]}>{header}</View> : null}
      </BottomSheetHandle>
    ),
    [header, handleColor, borderColor],
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      maxDynamicContentSize={height * maxHeightShare}
      enablePanDownToClose
      onDismiss={onDismiss}
      onChange={index => {
        if (index >= 0) onShow?.();
      }}
      // A sheet with a text field rises above the keyboard, and comes back down when the keyboard goes.
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      // A swipe on the body only scrolls it; the sheet is dragged (and closed) by its handle and header, or by a tap on the
      // backdrop. Otherwise pulling the list down at its top would start pulling the whole sheet down first.
      enableContentPanningGesture={false}
      detached
      bottomInset={gap}
      style={{ marginHorizontal: gap, borderRadius: radius, borderCurve: 'continuous', overflow: 'hidden' }}
      backgroundStyle={{
        backgroundColor,
        borderRadius: radius,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor,
      }}
      handleComponent={renderHandle}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView>{children}</BottomSheetScrollView>
    </BottomSheetModal>
  );
});

FloatingSheet.displayName = 'FloatingSheet';

const styles = StyleSheet.create({
  // The handle's own padding is dropped so the header can run edge to edge; the grab bar keeps its 10 above.
  handle: { padding: 0, paddingTop: 10 },
  header: { borderBottomWidth: 1 },
});
