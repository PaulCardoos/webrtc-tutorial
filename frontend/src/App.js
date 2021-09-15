import './App.css';
import Call from "./components/Call.js"
import React from "react"
import { BrowserRouter, Route, Switch} from "react-router-dom"
import CreateRoom from './components/CreateRoom';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={CreateRoom} /> 
          <Route path="/blueforce/conference/:conference_room_id" component={Call} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
