import React from "react";

export default function curry(reactElement) {
    const { props: curriedProps, type: CurriedType } = reactElement;
    return function Curried(props) {
        const combinedProps = { ...curriedProps, ...props };
        return <CurriedType { ...combinedProps } />;
    };
}

export function curryHard(reactElement) {
    const { props: curriedProps, type: CurriedType } = reactElement;
    return function Curried(props) {
        const combinedProps = { ...props, ...curriedProps };
        return <CurriedType { ...combinedProps } />;
    };
}
