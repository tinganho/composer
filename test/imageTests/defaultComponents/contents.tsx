
/// <reference path='../../../typings/platform/platform.d.ts' />
/// <reference path='../../../src/component/component.d.ts' />

import * as React from '../../../src/component/element';
import { ComposerContent, ComposerComponent, Link } from '../../../src/component/layerComponents';

interface NavigationBarProps extends Props {
    a: string;
    b: string;
}

interface NavigationBarElements extends Elements {

}

export class NavigationBar extends ComposerContent<NavigationBarProps, {}, NavigationBarElements> {
    public static fetch(): Promise<NavigationBarProps> {
        let promise = new Promise((resolve, reject) => {
            resolve({ a: 'a', b: 'b' });
        });

        return promise;
    }

    public bindDOM(): void {
        super.bindDOM();
        this.root.onClick(() => {
            alert('hej')
        });
    }

    public render() {
        return (
            <div class='NavigationBar'>{this.props.a + this.props.b}</div>
        );
    }
}

interface TodoItemProps extends Props {
    title: string;
    description: string;
}

interface TodoListItemElements extends Elements {

}

class TodoListItem extends ComposerComponent<TodoItemProps, {}, TodoListItemElements> {
    public render() {
        return (
            <li>
                <div class={`TodoListItem`}>
                    <Link id={`TodoListItemAnchor${this.props.id}`} to='/todo' class='TodoItemAnchor'>
                        <h1>{this.props.title}</h1>
                        <p>{this.props.description}</p>
                    </Link>
                </div>
            </li>
        );
    }
}

interface TodoListProps extends Props {
    list: TodoItemProps[];
}

interface TodoListElements extends Elements {

}

export class TodoList extends ComposerContent<TodoListProps, {}, TodoListElements> {
    public static fetch(): Promise<TodoListProps> {
        let promise = new Promise<TodoListProps>((resolve, reject) => {
            resolve({ list: [
                {
                    id: 1,
                    title: 'Donec id elit non mi porta gravida at eget metus.',
                    description: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.',
                },
                {
                    id: 2,
                    title: 'Sed posuere consectetur est at lobortis.',
                    description: 'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.',
                },
                {
                    id: 3,
                    title: 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.',
                    description: 'Maecenas sed diam eget risus varius blandit sit amet non magna.',
                },
                {
                    id: 4,
                    title: 'Etiam porta sem malesuada magna mollis euismod.',
                    description: 'Maecenas faucibus mollis interdum.',
                }
            ]});
        });

        return promise;
    }

    public render() {
        return (
            <div class='TodoList'>
                <ul>
                    {this.props.list.map(todo =>{
                        return <TodoListItem key={todo.id} id={todo.id} title={todo.title} description={todo.description}/>
                    })}
                </ul>
            </div>
        );
    }
}

interface TodoItemElements extends Elements {

}

export class Todo extends ComposerContent<TodoItemProps, {}, TodoItemElements> {
    public static fetch(): Promise<TodoItemProps> {
        let promise = new Promise<TodoItemProps>((resolve, reject) => {
            resolve({
                id: 1,
                title: 'Donec id elit non mi porta gravida at eget metus.',
                description: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.',
            });
        });

        return promise;
    }

    public render() {
        return (
            <div class='todo' id={`todo-${this.props.id}`}></div>
        );
    }
}
