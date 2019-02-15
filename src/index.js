import React from "react";
import getDisplayName from "react-display-name";
import { allowOverwrite, forceCurry, mergeComplexProps } from "./reducers";

export function curry(reactElement, displayName, propsReducer = allowOverwrite) {
    const { props: curriedProps, type: CurriedType } = reactElement;
    const curriedComponent = function Curried(props) {
        const combinedProps = propsReducer(curriedProps, props);
        return <CurriedType { ...combinedProps } />;
    };
    curriedComponent.displayName = displayName || `Curried(${ getDisplayName(CurriedType) })`;
    curriedComponent.propTypes = CurriedType.propTypes;
    return curriedComponent;
}

export function currySoft(reactElement, displayName) {
    return curry(reactElement, displayName, allowOverwrite);
}

export function curryHard(reactElement, displayName) {
    return curry(reactElement, displayName, forceCurry);
}

export function currySmart(reactElement, displayName, isHard = false) {
    const propsReducer = (curriedProps, props) => mergeComplexProps(curriedProps, props, isHard);
    return curry(reactElement, displayName, propsReducer);
}
