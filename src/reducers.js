export function allowOverwrite(curriedProps, props) {
    return { ...curriedProps, ...props };
}

export function forceCurry(curriedProps, props) {
    return { ...props, ...curriedProps };
}

const unique = array => Array.from(new Set(array));

function getAllPropNames(curriedProps, props) {
    return unique([ ...Object.keys(curriedProps), ...Object.keys(props) ]);
}

function mergeObjects(curriedProp = {}, prop = {}, isHard) {
    return isHard ?
        { ...prop, ...curriedProp } :
        { ...curriedProp, ...prop };
}

function mergeDefault(curriedProp, prop, isHard) {
    return isHard ?
        curriedProp || prop:
        prop || curriedProp;
}

function mergeClasses(curriedProp = "", prop = "") {
    return `${curriedProp} ${prop}`.trim();
}

function throwCombinedError(...errors) {
    const actualErrors = errors.filter(error => error instanceof Error);
    if (actualErrors.length === 0) {
        return;
    }
    if (actualErrors.length === 1) {
        throw actualErrors[0];
    }
    throw new Error(actualErrors.map(error => error.message).join(" "));
}

function mergeHandlers(curriedProp, prop) {
    if ( curriedProp && prop ) {
        return (...args) => {
            let curryError = undefined;
            let otherError = undefined;

            try {
                prop(...args);
            } catch (error) {
                otherError = error;
            }

            try {
                curriedProp(...args);
            } catch (error) {
                curryError = error;
            }

            throwCombinedError(curryError, otherError);
        };
    }
    return curriedProp || prop;
}

function getMergeStrategy(propName) {
    if ( propName === "className") {
        return mergeClasses;
    }
    if ( propName.match(/^on[A-Z]/) ) {
        return mergeHandlers;
    }
    if ( propName === "style") {
        return mergeObjects;
    }
    return mergeDefault;
}

export function mergeComplexProps(curriedProps, props, isHard) {
    const resultProps = {};
    getAllPropNames(curriedProps, props).forEach(propName => {
        const curriedProp = curriedProps[propName];
        const prop = props[propName];
        const merge = getMergeStrategy(propName);
        resultProps[propName] = merge(curriedProp, prop, isHard);
    });
    return resultProps;
}
