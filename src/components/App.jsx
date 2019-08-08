import React, { Component } from "react";
import Header from "./header";
import Create from "./create-task";
import Tasks from "./tasks";
import Guess from "./guess";
import Deleteall from "./delete-all";
import Link from "./link";
import ModalAlert from "./modal";

// IMPORT SLANG
import Slang from "slang-web-sdk";

import "../styles/App.css";

export default class App extends Component {
  state = {
    tasks: [],
    selectedTask: undefined
  };

  componentDidMount = () => {
    /**
     *
     * SLANG INTEGRATION CODE BEGIN
     *
     */

    const hints = {
      "en-IN": ["add","to", "task", "clear"]
  }

    // Slang initialization
    Slang.initialize({
      buddyId: "2e21eb3d46da42738e377a57e96e4738",
      apiKey: "15da9e8658bc4f089306bd1bb11ceea4",
      env: "stage", // one of ['stage','prod']
      locale: "en-IN",
      onSuccess: () => {
        console.log("Slang initialized successfully");
        // Add the ASR hints to improve recognition of certain words
        Slang.setASRHints(hints);
      },
      onFailure: () => {
        console.log("Slang Failed to initialize");
      }
    });

    // NOTE: notice that `this` is in scope as componentDidMount is an arrow function
    const intentHandler = intent => {
      // This is the intenthandler function.
      // This gets passed the intent by Slang and you can perform actions in here.
      // You have to register this function with Slang
      switch (intent.name) {
        case "add_task":
          const taskToAdd = intent
            .getEntity("task")
            .value.trim() // trim() is standard js string operation. Not part of Slang
            .toLowerCase(); // toLowerCase() is standard js string operation. Not part of Slang
          const addTaskValue = this.addTask(taskToAdd);
          if (addTaskValue === "success") {
            return true;
          } else if (addTaskValue === "task_already_exists") {
            // set the negative prompt on the client itself overriding anything configured in the console
            intent.completionStatement.overrideNegative(
              "This task already exists"
            );
            // Slang will speak out negative prompt (if any) and consider the action to have failed
            return false;
          } else {
            return false;
          }

        case "delete_task":
          if (this.state.tasks.length)
          {
            const taskToDelete = intent
            .getEntity("task")
            .value.trim()
            .toLowerCase();
            this.deleteTask(taskToDelete);
            return true;
          } else {
            intent.completionStatement.overrideNegative(
              "There is no tasks in your list yet"
            );
            
            return false;
          }

        case "delete_all_tasks":
          if (this.state.tasks.length) {
            this.deleteAll();
          } else {
            intent.completionStatement.overrideNegative(
              "There is no tasks in your list yet"
            );
            return false;
          }
          return true;
        default:
          return false;
      }
    };

    // Register your intentaction handler with Slang
    Slang.setIntentActionHandler(intentHandler);

    /**
     *
     * SLANG INTEGRATION CODE END
     *
     */

    try {
      const json = localStorage.getItem("tasks");
      const tasks = JSON.parse(json);

      if (tasks) {
        this.setState(() => ({ tasks }));
      }
    } catch (e) {
      this.setState(() => ({ selectedTask: "Something went wrong!" }));
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.tasks.length !== this.state.tasks.length) {
      const json = JSON.stringify(this.state.tasks);
      localStorage.setItem("tasks", json);
    }
  };

  deleteTask = taskTodelete => {
    this.setState(prevState => ({
      tasks: prevState.tasks.filter(task => taskTodelete !== task)
    }));
  };

  whatTodo = () => {
    const randNum = Math.floor(Math.random() * this.state.tasks.length);
    const task = this.state.tasks[randNum];
    this.setState(() => ({ selectedTask: task }));
  };

  deleteAll = () => {
    this.setState(() => ({ tasks: [] }));
  };

  closeModal = () => {
    this.setState(() => ({ selectedTask: undefined }));
  };

  addTask = singletask => {
    if (!singletask) {
      this.setState(() => ({ selectedTask: "Please enter a task!" }));
      return "task_field_is_empty";
    } else if (this.state.tasks.indexOf(singletask) > -1) {
      this.setState(() => ({ selectedTask: "This task already exists!" }));
      return "task_already_exists";
    } else {
      this.setState(prevState => ({ tasks: [...prevState.tasks, singletask] }));
      return "success";
    }
  };

  onSubmit = event => {
    event.preventDefault();
    const singletask = event.target.elements.singletask.value
      .trim()
      .toLowerCase();
    this.addTask(singletask);

    event.target.elements.singletask.value = "";
  };
  render() {
    return (
      <div>
        <Header />
        <Create onSubmit={this.onSubmit} />
        {this.state.tasks.length > 0 ? (
          <Guess whatTodo={this.whatTodo} />
        ) : null}
        {this.state.tasks.length === 0 && (
          <div className="center-text">
            <h4>Please Enter a task!</h4>
          </div>
        )}
        {this.state.tasks.length > 0 ? (
          <Tasks tasks={this.state.tasks} deleteTask={this.deleteTask} />
        ) : null}
        {this.state.tasks.length > 0 ? (
          <Deleteall deleteAll={this.deleteAll} />
        ) : null}
        <ModalAlert
          selectedTask={this.state.selectedTask}
          closeModal={this.closeModal}
        />
        <Link />
      </div>
    );
  }
}
