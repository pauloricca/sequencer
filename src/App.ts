import React from 'react';
import { Controller } from 'components/Controller/Controller';
import { createRoot } from 'react-dom/client';
require('./_App.scss');

export class App {
  constructor () {
    this.render();
  }

  private render (): void {
    const rootEl = document.getElementById('app');
    if (rootEl) {
      const root = createRoot(rootEl);
      root.render(React.createElement(Controller));
    }
  }
}

new App();
