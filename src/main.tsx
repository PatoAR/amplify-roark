import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { BrowserRouter } from 'react-router-dom';
//import { ResourcesConfig } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App.tsx"
//import config from './aws-exports';
import outputs from './amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import "./index.css";

Amplify.configure(outputs);

// Custom Header component for the Authenticator
const components = {
  Header() {
    return (
      <p></p>  
    );
  },
  Footer() {
    return (
    <p></p>
  )}
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator components={components}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </Authenticator>
  </React.StrictMode>
);