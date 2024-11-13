import React from "react";
import { View } from "react-native";

import { ReactNode } from "react";
import Navbar from "./components/Navbar";

export default function Activitieslayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <View>
      <Navbar />
      {children}
    </View>
  );
}
