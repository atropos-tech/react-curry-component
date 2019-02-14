[![npm package](https://img.shields.io/npm/v/react-curry-component.svg)](https://www.npmjs.com/package/react-curry-component)
[![npm downloads](https://img.shields.io/npm/dw/react-curry-component.svg)](https://www.npmjs.com/package/react-curry-component)
[![licence](https://img.shields.io/npm/l/react-curry-component.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://img.shields.io/codecov/c/gh/atropos-tech/react-curry-component.svg)](https://codecov.io/gh/atropos-tech/react-curry-component)
[![CircleCI](https://circleci.com/gh/atropos-tech/react-curry-component/tree/master.svg?style=svg)](https://circleci.com/gh/atropos-tech/react-curry-component/tree/master)
[![bundlephobia](https://img.shields.io/bundlephobia/min/react-curry-component.svg)](https://bundlephobia.com/result?p=react-curry-component)
[![LGTM alerts](https://img.shields.io/lgtm/alerts/g/atropos-tech/react-curry-component.svg)](https://lgtm.com/projects/g/atropos-tech/react-curry-component/alerts)
[![LGTM grade](https://img.shields.io/lgtm/grade/javascript/g/atropos-tech/react-curry-component.svg)](https://lgtm.com/projects/g/atropos-tech/react-curry-component/context:javascript)

A small utility for easily creating specialised versions of existing React components, based on the functional programming concept of [currying](https://en.wikipedia.org/wiki/Currying).

# Motivation
Frequently in React we want to take an out-of-the-box component, or a generic one we've created ourselves, and use it in a specialised way. Let's say, for example, that our app has Call To Action buttons that use the Material UI `Button` component, but with the `variant="raised"` prop to give it more visual emphasis:

```jsx
function MyAppForm({ formData, onSubmit }) {
    return (
        <Form>
            // form fields go here

            <Button variant="raised" onClick={ onSubmit }>Submit Form</Button>
        </Form>
    );
}
```

If we use these everywhere, it's a good idea to create a React component to represent this sort of use case, so that if we want to change the apperance or behaviour of all the buttons, we can just update our component. So we do

```jsx
function CallToAction(props) {
    return <Button variant="raised" { ...props } />;
}
```

This is fine, but a little more boilerplatey than we need. We only need to supply three things to make this declaration:
 1. The component we want to specialise (`Button` in this case)
 2. The props we want to use to specialise it (`{ variant: "raised" }` here)
 3. The displayname of the component (`CallToAction`) - this is optional and could be autogenerated.

 This suggests a possible simpler syntax for this sort of operation:

 ```javascript
 const CallToAction = curry(Button, { variant: "raised"}, "CallToAction");
 ```

 &hellip;but we can be even more concise once we notice that `React Component Type + props = React Element`. So we can instead write simply

```jsx
 const CallToAction = curry(<Button variant="raised" />, "CallToAction");
 ```

 This is much more readable and allows lots of cool tricks, like dynamically creating your curry based on the output of other components.

 # Usage
 Install with `npm install react-curry-component`, then use like this:

 ```jsx
import React from 'react';
import { Button } from '@material-ui/core';
import curry from 'react-curry-component';

const CallToAction = curry(<Button variant="raised" />, "CallToAction");
```

## React Displayname
The second argument is optional and defaults to a generated displayname of the form `Curried(ComponentType)`:

```jsx
// this will have the name `Curried(Button)`
const CallToAction = curry(<Button variant="raised" />);
```

# Advanced techniques

## Soft and Hard currying
Unlike currying in Functional Programming, there's a possibility that your curried component could get props that contradicts the ones you provide in your curry. In most cases we probably want this more "recent" value to take precedence - we call this a **soft curry**, and it's a lot like providing default props. However, in some cases, we may want our curried props to take precendence, in which case we call it a **hard curry**.

```jsx
import React from 'react';
import { Button } from '@material-ui/core';
import { curryHard, currySoft } from 'react-curry-component';

const DefaultRaisedButton = currySoft(<Button variant="raised" />);
const buttonElement2 = <DefaultRaisedButton variant="outlined" />; // variant will be "outlined"

const AlwaysRaisedButton = curryHard(<Button variant="raised" />);
const buttonElement1 = <AlwaysRaisedButton variant="outlined" />; // variant will be "raised"
```

The default export for this package is `currySoft`.

## Custom prop behaviour
In some specialised circumstances you may want to customised the currying behaviour for certain props, so you can supply a `propsReducer` that determines exactly how the curried props are combined with the element props. This can be useful when you want to merge complex props at different levels, like `className` or `style`:

```jsx
import React from 'react';
import { Button } from '@material-ui/core';
import { curry } from 'react-curry-component';

function classNameReducer(curriedProps, props) {
    const { className: curryClassName, ...otherCurriedProps } = curriedProps;
    const { className, ...otherProps } = props;

    const combinedClassName = [ curryClassName, className ].filter(Boolean).join(" ");

    // always use the curried variant (hard)
    // but other props can be overwritten (soft)
    return { ...otherCurriedProps, ...otherProps, className: combinedClassName };
}

const Btn = curry(<Button className="btn" />, "Btn", classNameReducer);

// className will be "big btn"
const buttonElement = <Btn className="big" />; 
```

You can also do this for event callbacks, for example if you want to trigger one callback from the curried props and one from the normal props:

```jsx
import React from 'react';
import { Button } from '@material-ui/core';
import { curry } from 'react-curry-component';

function onClickReducer(curriedProps, props) {
    const { onClick: curryOnClick, ...otherCurriedProps } = curriedProps;
    const { onClick, ...otherProps } = props;

    const combinedOnClick = (...args) => {
        curryOnClick(...args);
        onClick(...args);
    };

    return { ...otherCurriedProps, ...otherProps, claonClickssName: combinedOnClick };
}

const handleClick1 => console.log("click 1");
const handleClick2 => console.log("click 2");

const Btn = curry(<Button onClick={ handleClick1 } />, "Btn", onClickReducer);

// When clicked, this will trigger both click handlers in sequence
const buttonElement = <Btn onClick={ handleClick2 } />; 
```

Bear in mind that your `propsReducer` function will be called on every render of every instance of your curried function, so avoid making it too intensive if you're planning to do lots of frequent updates on a large number of curried elements.