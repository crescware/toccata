'use strict';
import 'babel-core/polyfill';

import angular from '../take-angular';
import {Toccata, default as toccata_} from '../../../../src/toccata';
let toccata: Toccata = toccata_(angular);
import {TodoStore} from './todo-store';

let {Component, View, bootstrap, For} = toccata;

toccata.initModule('toccataFixtures', []);

@Component({
  selector: 'todo-app',
  injectables: [
    TodoStore
  ]
})
@View({
  templateUrl: 'todo.html',
  directives: [For]
})
class TodoApp {
  todoStore: TodoStore;
  todoEdit: any;
  todos: Array<any>;

  constructor(store: TodoStore) {
    this.todoStore = store;
    this.todoEdit = null;
    this.todos = store.list;
  }
  enterTodo($event: any, newTodo: any) {
    if($event.which === 13) { // ENTER_KEY
      this.addTodo(newTodo.value);
      newTodo.value = '';
    }
  }
  editTodo($event: any, todo: any) {
    this.todoEdit = todo;
  }
  doneEditing($event: any, todo: any) {
    var which = $event.which;
    var target = $event.target;
    if(which === 13) {
      todo.title = target.value;
      this.todoStore.save(todo);
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      target.value = todo.title;
    }
  }
  addTodo(newTitle: any) {
    this.todoStore.add({
      title: newTitle,
      completed: false
    });
  }
  completeMe(todo: any) {
    todo.completed = !todo.completed;
    this.todoStore.save(todo);
  }
  deleteMe(todo: any) {
    this.todoStore.remove(todo);
  }
  toggleAll($event: any) {
    var isComplete = $event.target.checked;
    this.todoStore.list.forEach((todo: any) => {
      todo.completed = isComplete;
      this.todoStore.save(todo);
    });
  }
  clearCompleted() {
    [].concat(this.todoStore.list).forEach((todo) => {
      if(todo.completed) {
        this.deleteMe(todo);
      }
    });
  }

}

bootstrap(TodoApp);