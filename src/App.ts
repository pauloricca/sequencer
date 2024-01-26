import React from "react";
import { Controller } from "./components/Controller/Controller";
import { createRoot } from "react-dom/client";
require("./_App.scss");

export class App
{
    constructor()
    {
        this.render();
    }

    private render(): void
    {
        const root = createRoot(document.getElementById("app") || document.createElement("div"));
        root.render(React.createElement(Controller));
    }
}

new App();