import { Fragment } from "react";
import FriStatus from "./friStatus";
import MonStatus from "./monStatus";
import SatStatus from "./satStatus";
import SunStatus from "./sunStatus";
import ThursStatus from "./thursStatus";
import TuesStatus from "./tuesStatus";
import WedStatus from "./wedStatus";

type RecurringDayStatusTagsProps = {
    recurringPattern?: string | null;
};

const dayTokenToIndex: Record<string, number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    TUES: 2,
    WED: 3,
    THU: 4,
    THUR: 4,
    THURS: 4,
    FRI: 5,
    SAT: 6,
};

const parseRecurringDayIndices = (recurringPattern?: string | null): number[] => {
    if (!recurringPattern) {
        return [];
    }

    const [patternNameRaw, dayListRaw] = recurringPattern.split(":");
    const patternName = patternNameRaw?.trim();

    if (patternName !== "Weekly" && patternName !== "Custom (Specific Days)") {
        return [];
    }

    if (!dayListRaw) {
        return [];
    }

    const indices = dayListRaw
        .split(",")
        .map((token) => dayTokenToIndex[token.trim().toUpperCase()])
        .filter((day): day is number => typeof day === "number");

    return [...new Set(indices)].sort((a, b) => a - b);
};

export const getRecurringPatternBase = (recurringPattern?: string | null): string | null => {
    if (!recurringPattern) {
        return null;
    }

    const base = recurringPattern.split(":")[0]?.trim();

    if (!base) {
        return null;
    }

    if (base === "Custom (Specific Days)") {
        return "Weekly";
    }

    return base;
};

export default function RecurringDayStatusTags({ recurringPattern }: RecurringDayStatusTagsProps) {
    const dayIndices = parseRecurringDayIndices(recurringPattern);

    if (dayIndices.length === 0) {
        return null;
    }

    return (
        <>
            {dayIndices.map((dayIndex) => {
                switch (dayIndex) {
                    case 0:
                        return (
                            <Fragment key="day-sun">
                                <SunStatus />
                            </Fragment>
                        );
                    case 1:
                        return (
                            <Fragment key="day-mon">
                                <MonStatus />
                            </Fragment>
                        );
                    case 2:
                        return (
                            <Fragment key="day-tue">
                                <TuesStatus />
                            </Fragment>
                        );
                    case 3:
                        return (
                            <Fragment key="day-wed">
                                <WedStatus />
                            </Fragment>
                        );
                    case 4:
                        return (
                            <Fragment key="day-thu">
                                <ThursStatus />
                            </Fragment>
                        );
                    case 5:
                        return (
                            <Fragment key="day-fri">
                                <FriStatus />
                            </Fragment>
                        );
                    case 6:
                        return (
                            <Fragment key="day-sat">
                                <SatStatus />
                            </Fragment>
                        );
                    default:
                        return null;
                }
            })}
        </>
    );
}
