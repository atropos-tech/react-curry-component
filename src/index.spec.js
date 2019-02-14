/* eslint-disable react/prop-types */

import React, { Component } from "react";
import { curry, curryHard, currySoft } from "./index";
import { mount } from "enzyme";

function SomeFunctionComponent() {
    return <span />;
}

class SomeClassComponent extends Component {
    render() {
        return this.props.children;
    }
}

describe("curry package", () => {

    it("performs a basic curry", () => {
        expect.assertions(1);

        const CurriedComponent = curry(<div className="some-class" />);
        const curriedWrapper = mount(<CurriedComponent id="some-id" />);
        const expectedWrapper = mount(<div className="some-class" id="some-id" />);
        expect( curriedWrapper ).toHaveHTML(expectedWrapper.html());
    });

    it("performs a soft curry", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<div className="some-class" />);
        const curriedWrapper = mount(<CurriedComponent className="some-other-class" />);
        const expectedWrapper = mount(<div className="some-other-class" />);
        expect( curriedWrapper ).toHaveHTML(expectedWrapper.html());
    });

    it("performs a hard curry", () => {
        expect.assertions(1);

        const CurriedComponent = curryHard(<div className="some-class" />);
        const curriedWrapper = mount(<CurriedComponent className="some-other-class" />);
        const expectedWrapper = mount(<div className="some-class" />);
        expect( curriedWrapper ).toHaveHTML(expectedWrapper.html());
    });

    it("performs a custom curry", () => {
        expect.assertions(2);

        const somePropsReducer = jest.fn(() => ({ id: "some-custom-id" }));
        const CurriedComponent = curry(<div className="some-class" />, undefined, somePropsReducer);
        const curriedWrapper = mount(<CurriedComponent className="some-other-class" />);
        const expectedWrapper = mount(<div id="some-custom-id" />);
        expect( curriedWrapper ).toHaveHTML(expectedWrapper.html());
        expect(somePropsReducer).toHaveBeenCalledWith({ className: "some-class" }, { className: "some-other-class" });
    });

    it("generates a default display name if none is provided (for native components)", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<div className="some-class" />);
        expect(CurriedComponent.displayName).toEqual("Curried(div)");
    });

    it("generates a default display name if none is provided (for function components)", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<SomeFunctionComponent className="some-class" />);
        expect(CurriedComponent.displayName).toEqual("Curried(SomeFunctionComponent)");
    });

    it("generates a default display name if none is provided (for class components)", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<SomeClassComponent className="some-class" />);
        expect(CurriedComponent.displayName).toEqual("Curried(SomeClassComponent)");
    });

    it("uses supplied display name if one is provided", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<div className="some-class" />, "ClassyDiv");
        expect(CurriedComponent.displayName).toEqual("ClassyDiv");
    });

});
