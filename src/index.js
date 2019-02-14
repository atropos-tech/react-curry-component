import React from "react";
import getDisplayName from "react-display-name";

function allowOverwrite(curriedProps, props) {
    return { ...curriedProps, ...props };
}

function forceCurry(curriedProps, props) {
    return { ...props, ...curriedProps };
}

export function curry(reactElement, displayName, propsReducer = allowOverwrite) {
    const { props: curriedProps, type: CurriedType } = reactElement;
    const curriedComponent = function Curried(props) {
        const combinedProps = propsReducer(curriedProps, props);
        return <CurriedType { ...combinedProps } />;
    };
    curriedComponent.displayName = displayName || `Curried(${ getDisplayName(CurriedType) })`;
    return curriedComponent;
}

export function currySoft(reactElement, displayName) {
    return curry(reactElement, displayName, allowOverwrite);
}

export function curryHard(reactElement, displayName) {
    return curry(reactElement, displayName, forceCurry);
}
