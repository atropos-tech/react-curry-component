/* eslint-disable react/prop-types */
/* eslint-disable no-magic-numbers */

import React, { Component } from "react";
import { curry, curryHard, currySoft, currySmart } from "./index";
import { mount } from "enzyme";
import { string } from "prop-types";

function SomeFunctionComponent() {
    return <span />;
}

class SomeClassComponent extends Component {
    render() {
        return <span>{ this.props.someProps }</span>;
    }
}

SomeClassComponent.propTypes = {
    someProps: string
};

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

    it("performs a smart curry(soft)", () => {
        expect.assertions(6);

        const curryClickHandler = jest.fn();
        const clickHandler = jest.fn();
        const CurriedComponent = currySmart(
            <div className="some-class" onClick={ curryClickHandler } style={ { color: "white", fontWeight: "bold" } } id="some-id" />,
            undefined,
            false
        );
        const wrapper = mount(<CurriedComponent className="some-other-class" onClick={ clickHandler } style={ { color: "black" } } />);
        expect(wrapper).toMatchSnapshot();

        const renderedDiv = wrapper.find("div");
        expect(renderedDiv).toHaveClassName("some-class some-other-class");
        expect(renderedDiv).toHaveStyle({ color: "black", fontWeight: "bold" });
        expect(renderedDiv).toHaveProp("id", "some-id");
        renderedDiv.simulate("click");
        expect(clickHandler).toHaveBeenCalled();
        expect(curryClickHandler).toHaveBeenCalled();
    });


    it("performs a smart curry(hard)", () => {
        expect.assertions(6);

        const curryClickHandler = jest.fn();
        const clickHandler = jest.fn();
        const CurriedComponent = currySmart(
            <div className="some-class" onClick={ curryClickHandler } style={ { color: "white" } } />,
            undefined,
            true
        );
        const wrapper = mount(<CurriedComponent onClick={ clickHandler } style={ { color: "black", fontWeight: "bold" } } id="some-id" />);
        expect(wrapper).toMatchSnapshot();

        const renderedDiv = wrapper.find("div");
        expect(renderedDiv).toHaveClassName("some-class");
        expect(renderedDiv).toHaveStyle({ color: "white", fontWeight: "bold" });
        expect(renderedDiv).toHaveProp("id", "some-id");
        renderedDiv.simulate("click");
        expect(clickHandler).toHaveBeenCalled();
        expect(curryClickHandler).toHaveBeenCalled();
    });

    it("merges handler errors on a smart curry", () => {
        expect.assertions(1);

        const curryClickHandler = () => {
            throw new Error("some-error");
        };
        const clickHandler = () => {
            throw new Error("some-other-error");
        };
        const CurriedComponent = currySmart(
            <div onClick={ curryClickHandler } />,
            undefined,
            true
        );
        const wrapper = mount(<CurriedComponent onClick={ clickHandler } />);
        expect(() => wrapper.find("div").simulate("click")).toThrow("some-error some-other-error");
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
        const wrapper = mount(<CurriedComponent />);
        expect(wrapper).toHaveDisplayName("Curried(div)");
    });

    it("generates a default display name if none is provided (for function components)", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<SomeFunctionComponent className="some-class" />);
        const wrapper = mount(<CurriedComponent />);
        expect(wrapper).toHaveDisplayName("Curried(SomeFunctionComponent)");
    });

    it("generates a default display name if none is provided (for class components)", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<SomeClassComponent className="some-class" />);
        const wrapper = mount(<CurriedComponent />);
        expect(wrapper).toHaveDisplayName("Curried(SomeClassComponent)");
    });

    it("uses supplied display name if one is provided", () => {
        expect.assertions(1);

        const CurriedComponent = currySoft(<div className="some-class" />, "ClassyDiv");
        const wrapper = mount(<CurriedComponent />);
        expect(wrapper).toHaveDisplayName("ClassyDiv");
    });

    it("gives same propTypes to curried component", () => {
        expect.assertions(1);

        const CurriedComponent = curry(<SomeClassComponent className="some-class" />);
        expect(CurriedComponent.propTypes).toEqual(SomeClassComponent.propTypes);
    });

});

