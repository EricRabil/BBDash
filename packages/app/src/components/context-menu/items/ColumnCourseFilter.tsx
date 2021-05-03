import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Item, Submenu } from "react-contexify";
import { CourseBlacklistContext } from "../../../contexts/course-blacklist-context";
import CourseConsumer from "../../../contexts/course-context";
import { ModifierKeyContext } from "../../../contexts/modifier-key-context";

export default function ColumnCourseFilter() {
    return (
        <Submenu label="Hidden Courses" className="hidden-course-checklist">
            <CourseConsumer>
                {({ courses, courseIDs }) => (
                    <ModifierKeyContext.Consumer>
                        {({ shift }) => (
                            <CourseBlacklistContext.Consumer>
                                {({ locallyBlacklistedCourses: blacklistedCourses, setBlacklisted }) => (
                                    (shift ? courseIDs.filter(courseID => blacklistedCourses.includes(courseID)) : courseIDs).map(courseID => (
                                        <Item key={courseID} onClick={e => {
                                            e.event.stopPropagation();
                                            setBlacklisted(courseID, !blacklistedCourses.includes(courseID));
                                        }} className="hidden-course-option" role="checkbox" aria-checked={blacklistedCourses.includes(courseID)}>
                                            <span className="visibility-indicator" role="presentation"><FontAwesomeIcon icon={blacklistedCourses.includes(courseID) ? "eye-slash" : "eye"} /></span> {courses[courseID].displayName}
                                        </Item>
                                    ))
                                )}
                            </CourseBlacklistContext.Consumer>
                        )}
                    </ModifierKeyContext.Consumer>
                )}
            </CourseConsumer>
        </Submenu>
    );
}