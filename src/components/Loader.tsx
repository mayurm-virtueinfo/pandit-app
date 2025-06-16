import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  View,
  ModalProps,
} from "react-native";

import { COLORS } from "../theme/theme";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

interface LoaderProps extends Partial<ModalProps> {
  loading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ loading }) => {
  return (
    <Modal
      transparent
      animationType="none"
      visible={loading}
      onRequestClose={() => {
        console.log("close modal");
      }}
    >
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator
            animating={loading}
            size="large"
            color={COLORS.primary}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#00000040",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    height: verticalScale(50),
    width: scale(50),
    borderRadius: moderateScale(100),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
});

export default Loader;
