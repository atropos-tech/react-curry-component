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

## Smart currying
For some React props, it makes more sense to do some sort of clever merge rather than just use either prop. For example, with `className` or `style`, it makes more sense to use both the curried value and the supplied value. You can use `currySmart` to do this:

```jsx
import React from 'react';
import { currySmart } from 'react-curry-component';

const MyButton = currySmart(<button className="btn" />);
const buttonElement = <MyButton className="submit-btn" />; // className will be "btn submit-btn"

const MyTitle = currySmart(<h2 style={ { fontFamily: "Comic Sans" } } />);
const titleElement = <MyTitle style={ { padding: "8px" } }>Hurray for Curry!</MyTitle>; //will have the font family and the padding applied
```

In the case of event handlers, `currySmart` will ensure that both handlers are triggered:

```jsx
import React from 'react';
import { currySmart } from 'react-curry-component';

const MyButton = currySmart(<button onClick={ sendButtonAnalytics } />);
const buttonElement = <MyButton onClick={ handleSubmit } />; // clicking on this will trigger analytics and submit behaviour
```

All other props will be handled using the normal `currySoft` behaviour. You can switch to `curryHard` default behaviour like this:

```jsx
import React from 'react';
import { currySmart } from 'react-curry-component';

const MyButton = currySmart(<button onClick={ sendButtonAnalytics } />, true); // will prefer curried props
```

This also gives preference to curried style instructions if they conflict with the "normal" props.

## Custom prop behaviour
In some specialised circumstances you may want to customised the currying behaviour for certain props, so you can supply a `propsReducer` that determines exactly how the curried props are combined with the element props.

```jsx
import React from 'react';
import { Button } from '@material-ui/core';
import { curry } from 'react-curry-component';

function linkReducer(curriedProps, props) {
    const { href: curryHref, ...otherCurriedProps } = curriedProps;
    const { href, ...otherProps } = props;

    //only allow overwrite by HTTPS links
    const combinedHref = href.startsWith("https")) ? href : curryHref;

    //do a default soft curry on other props
    return { ...otherCurriedProps, ...otherProps, className: combinedClassName };
}

const Btn = curry(<Button className="btn" />, "Btn", classNameReducer);

// className will be "big btn"
const buttonElement = <Btn className="big" />; 
```

Bear in mind that your `propsReducer` function will be called on every render of every instance of your curried function, so avoid making it too intensive if you're planning to do lots of frequent updates on a large number of curried elements.