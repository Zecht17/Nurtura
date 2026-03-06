import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
     container: {
        flex: 1,
        // padding: 10,
        // paddingTop: 0,
        // paddingBottom: 0,
    },

    headerContainer: {
        paddingTop: 0,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
    },


    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    createButton: {
        // backgroundColor: "#7C6FDC",
        padding: 10,
        // paddingHorizontal: 20,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    cbuttonText: {
        color: "#fff",
        fontSize: 16,
        // fontWeight: "bold",
    },

    joinButton: {
        // backgroundColor: "#E0E0E0",
        padding: 10,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    jbuttonText: {
        color: "#7C6FDC",
        fontSize: 16,
        // fontWeight: "bold",
    },

    careContainer: {
        backgroundColor: "#fff",
        borderRadius: 14,
        margin: 18,
        padding: 20,
    },

    careTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },

    careDescription: {
        fontSize: 16,
        color: "#666",
    },

    caregiverRow: {
        flexDirection: "row",
        // gap: 10,
        marginTop: 15,
        justifyContent: "space-between",
        alignItems: "center",
    },

    careSubTitle: {
        fontSize: 18,
        // fontWeight: "bold",
        color: "#666",
        alignSelf: "flex-start",
        paddingTop: 5,
    },

    addCaregiverButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#ffffff",
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderColor: "#666",
        borderWidth: 1,
    },

    addCaregiverText: {
        color: "#333",
        fontSize: 14,
    },

    // caregiver styling
    caregiverList: {
        marginTop: 10,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#b3b3b3be",
        paddingBottom: 15,
    },

    caregiverItem: {
        backgroundColor: "#7C6FDC",
        width: 40,
        height: 40,
        padding: 10,
        borderRadius: 100,
    },

    careGiverIcon: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    caregiverName: {
        fontSize: 16,
        color: "#333",
    },

    caregiverNameRow: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "flex-start",
        alignItems: "center",
        alignContent: "center",
    },

    backupText: {
        fontSize: 14,
        color: "#999",
    },

    // Dependent styling

    dependentItem: {
        backgroundColor: "#7C6FDC",
        width: 40,
        height: 40,
        padding: 10,
        borderRadius: 100,
    },

    dependentIcon: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },

    dependentName: {
        fontSize: 16,
        color: "#333",
    },

    dependentNameRow: {
        flexDirection: "row",
        gap: 10,
        justifyContent: "flex-start",
        alignItems: "center",
        alignContent: "center",
    },

    dependentList: {
        marginTop: 10,
        gap: 10,
    },
});