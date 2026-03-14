import { StatusBar, View } from "react-native";

// The More tab now only serves as a placeholder; the modal is shown from the tab bar button.
export default function MoreScreen() {
    StatusBar.setBarStyle("dark-content");
    return <View />;
}