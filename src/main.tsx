import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { BrowserRouter } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App.tsx"
import outputs from './amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import "./index.css";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </Authenticator>
  </React.StrictMode>
);