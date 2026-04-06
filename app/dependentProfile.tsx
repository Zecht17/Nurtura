import AddDependentsButton from "@/components/buttons/addDependents";
import DependentCard from "@/components/cards/dependentCard";
import { NoDependentCard } from "@/components/cards/noDependent";
import DeleteDependentModal from "@/components/modals/deleteDependent";
import { getResponsiveTokens } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dependent, useDependents } from "../context/DependentContext";

export default function dependentProfile() {
    const { dependents: dependentList, loadingDependents, dependentsError, fetchMyDependents, deleteDependentProfile } = useDependents();
    const { width } = useWindowDimensions();
    const tokens = getResponsiveTokens(width);
    const compact = width < tokens.compactBreakpoint;
    const contentMaxWidth = tokens.containerMaxWidth;
    const headerPadding = tokens.pagePadding;
    const titleSize = tokens.title;
    const subtitleSize = tokens.subtitle;
    const narrowHeader = width < 390;
    const router = useRouter();
    const pathname = usePathname();
    const [deleteTarget, setDeleteTarget] = React.useState<Dependent | null>(null);
    const [deleteLoading, setDeleteLoading] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);

    StatusBar.setBarStyle("dark-content");

    React.useEffect(() => {
        if (pathname !== '/dependentProfile') {
            return;
        }

        fetchMyDependents();
    }, [pathname, fetchMyDependents]);

    const handleRefresh = React.useCallback(async () => {
        setRefreshing(true);

        try {
            await fetchMyDependents();
        } finally {
            setRefreshing(false);
        }
    }, [fetchMyDependents]);

    const getAge = (birthDate: string) => {
        const match = birthDate.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
        if (!match) return 0;

        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        const dob = new Date(year, month, day);

        if (isNaN(dob.getTime())) return 0;

        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const beforeBirthday = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate());

        if (beforeBirthday) age -= 1;
        return age < 0 ? 0 : age;
    };

    const resolveDependentNumericId = (dependent: Dependent) => {
        if (typeof dependent.dependentId === 'number') {
            return dependent.dependentId;
        }

        const parsed = Number.parseInt(dependent.id.replace('dep-', ''), 10);
        return Number.isNaN(parsed) ? null : parsed;
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        const dependentNumericId = resolveDependentNumericId(deleteTarget);

        if (!dependentNumericId) {
            Alert.alert('Delete Failed', 'Unable to resolve dependent ID for deletion.');
            setDeleteTarget(null);
            return;
        }

        try {
            setDeleteLoading(true);
            const message = await deleteDependentProfile(dependentNumericId);
            setDeleteTarget(null);
            Alert.alert('Deleted', message || 'Dependent profile deleted successfully.');
        } catch (err) {
            Alert.alert('Delete Failed', (err as Error).message || 'Unable to delete dependent profile.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const renderDependentCard = (dependent: Dependent) => {
        const safeUsername = dependent.username || '-';

        return (
            <DependentCard
                key={dependent.id}
                fullName={dependent.name}
                username={safeUsername}
                age={getAge(dependent.birthDate)}
                careNotes={dependent.careNotes || 'No care notes added.'}
                onOpenProfile={() =>
                    router.push({
                        pathname: '/dependentAccount',
                        params: { dependentId: dependent.dependentId ? `dep-${dependent.dependentId}` : dependent.id },
                    })
                }
                onEdit={() =>
                    router.push({
                        pathname: '/editDependent',
                        params: { dependentId: dependent.dependentId ? `dep-${dependent.dependentId}` : dependent.id },
                    })
                }
                onDelete={() => setDeleteTarget(dependent)}
            />
        );
    };

    return (
        <LinearGradient colors={["#E3F2FD", "#F3E5F8", "#E8E4F8"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={dependents.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                >
                    <View style={[dependents.container, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }] }>
                        <View style={[dependents.headerContainer, { padding: headerPadding }, (compact || narrowHeader) && dependents.headerContainerCompact]}>
                            <View style={[dependents.headerTextWrap, narrowHeader && dependents.headerTextWrapNarrow]}>
                                <Text style={[dependents.headerTitle, { fontSize: titleSize }]}>Dependent Profile</Text>
                                <Text style={[dependents.subHeader, { fontSize: subtitleSize }]}>Manage your dependent's{"\n"}information and preferences</Text>
                            </View>
                            <AddDependentsButton style={(compact || narrowHeader) && dependents.addButtonCompact} />
                        </View>

                        {!!dependentsError && (
                            <View style={dependents.errorContainer}>
                                <Text style={dependents.errorText}>{dependentsError}</Text>
                            </View>
                        )}

                        {loadingDependents && dependentList.length === 0 && (
                            <View style={dependents.loadingContainer}>
                                <ActivityIndicator size="large" color="#7C6FDC" />
                            </View>
                        )}

                        {dependentList.length === 0 ? (
                            <View style={dependents.emptyStateContainer}>
                                <NoDependentCard />
                            </View>
                        ) : (
                            dependentList.map(renderDependentCard)
                        )}

                    </View>
                </ScrollView>

                <DeleteDependentModal
                    visible={!!deleteTarget}
                    dependentName={deleteTarget?.name}
                    loading={deleteLoading}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        if (deleteLoading) {
                            return;
                        }
                        setDeleteTarget(null);
                    }}
                />

            </SafeAreaView>
        </LinearGradient>
    );
}

const dependents = StyleSheet.create({
    container: {
        padding: 10,
        // paddingTop: 0,
        // paddingBottom: 0,
    },

    scrollContent: {
        paddingBottom: 20,
    },

    emptyStateContainer: {
        marginHorizontal: 15,
        marginTop: 10,
    },

    loadingContainer: {
        marginTop: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    errorContainer: {
        marginHorizontal: 15,
        marginTop: 8,
        marginBottom: 4,
    },

    errorText: {
        color: '#D14343',
        fontSize: 13,
    },

    headerContainer: {
        paddingTop: 0,
        padding: 15,
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },

    headerContainerCompact: {
        alignItems: "flex-start",
        flexWrap: "wrap",
    },

    headerTextWrap: {
        minWidth: 0,
        flexShrink: 1,
    },

    headerTextWrapNarrow: {
        width: "100%",
    },

    addButtonCompact: {
        alignSelf: "flex-start",
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 0,
    },


    subHeader: {
        fontSize: 16,
        color: "#666",
        marginTop: 5,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 8,
    },
    headerIcon: {
        marginTop: 18,
    },

    dependentContainer: {
        // flex: 1,
        margin: 15,
        marginBottom: 0,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
    },

    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },

    // Icon background style
    iconBg: {
        width: 60,
        height: 60,
        borderRadius: 35,
        backgroundColor: "#7C6FDC",
        justifyContent: "center",
        alignItems: "center",
    },

    infoColumn: {
        flexDirection: "column",
        gap: 4,
        flex: 1,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        justifyContent: "space-between",
        flex: 1, // let the row fill available space so actions stay right-aligned
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    actionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        marginLeft: "auto", // push actions to the far right
    },

    actionButton: {
        width: 34,
        height: 28,
        borderRadius: 12,
        backgroundColor: "#f5f6f8",
        borderColor: "#e5e6eb",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    infoText: {
        fontSize: 18,
        fontWeight: "bold",
        // flexShrink: 1,
    },

    infoSubText: {
        fontSize: 14,
        color: "#666",
    },

    geninfoSubText: {
        fontSize: 14,
        color: "#666",
        paddingTop: 5,
    },

    genInfo: {
        marginTop: 10,
        marginLeft: 75, // align with text, accounting for icon width + gap
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: "#b3b3b3be",
    },
});