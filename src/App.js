import React, { StrictMode } from "react"
import logo from "./logo.svg"
import "./App.css"
import Examples from "./Example"

export default class App extends React.Component {
      render() {
            return (
                  <StrictMode>
                        <div style={{ marginTop: "40px" }}>
                              <Examples />
                        </div>
                  </StrictMode>
            )
      }
}
