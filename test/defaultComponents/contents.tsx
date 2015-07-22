
/// <reference path='../../typings/react/react.d.ts'/>
/// <reference path='../../typings/react/react-jsx.d.ts'/>
/// <reference path='../../typings/radium/radium.d.ts'/>
/// <reference path='../../typings/platform/platform.d.ts' />
/// <reference path='../../typings/react-addons-pure-render-mixin/react-addons-pure-render-mixin.d.ts'/>

let __r = require;
import { ComposerContent, Link } from '../../src/client/components';
import ReactType = require('react');
let React: typeof ReactType = inClient ? (window as any).React : __r('react');
import PureRenderMixinType = require('react-addons-pure-render-mixin');
let PureRenderMixin: typeof PureRenderMixinType = inClient ? require('/public/scripts/vendor/react-with-addons.js') : __r('react-addons-pure-render-mixin');
import RadiumType = require('radium');
let Radium: typeof RadiumType = inClient ? (window as any).Radium : __r('radium');

interface NavigationBarProps {
    a: string;
    b: string;
}

export class NavigationBar extends ComposerContent<NavigationBarProps, {}> {
    public mixins = [PureRenderMixin];

    public componentDidMount() {
        // console.log(React.findDOMNode(this));
    }

    static fetch(): Promise<NavigationBarProps> {
        let promise = new Promise((resolve, reject) => {
            resolve({a: 'a', b: 'b'})
        });

        return promise;
    }

    public render() {
        return (
            <div className='NavigationBar'>{this.props.a + this.props.b}</div>
        );
    }
}

interface TodoItemProps {
    key?: number;
    id?: number;
    title: string;
    description: string;
}

interface TodoListItemStyles extends Radium.Style {
    container: Radium.StyleDeclaration;
    title: Radium.StyleDeclaration;
    description: Radium.StyleDeclaration;
    link: Radium.StyleDeclaration;
}

const todoListItemStyles: TodoListItemStyles = {
    container: {
        position: 'relative',
        backgroundColor: '#333',
        listStyle: 'none',
        marginBottom: '20px',
        cursor: 'pointer',
        overflow: 'hidden',
    },
    title: {
        color: '#fff',
        fontFamily: 'Helvetica Neue',
        fontSize: '12px',
    },
    description: {
        color: '#fff',
        fontFamily: 'Helvetica Neue',
    },
    link: {
        padding: '20px',
        overflow: 'hidden',
        display: 'block',
    }
}

@Radium
class TodoListItem extends ComposerContent<TodoItemProps, {}> {
    public mixins = [PureRenderMixin];

    public render() {
        return (
            <li style={[todoListItemStyles.container]}>
                <div className='todo-list-item' id={`todo-list-item-${this.props.id}`}>
                    <Link to='/todo' style={[todoListItemStyles.link]}>
                        <h1 style={[todoListItemStyles.title]}>{this.props.title}</h1>
                        <p style={[todoListItemStyles.description]}>{this.props.description}</p>
                    </Link>
                </div>
            </li>
        );
    }
}

interface TodoListProps {
    list: TodoItemProps[];
}

interface TodoListStyles extends Radium.Style {
    list: Radium.StyleDeclaration;
}

const todoListStyle: TodoListStyles = {
    list: {
        width: '400px',
        margin: '0 auto',
    }
}

@Radium
export class TodoList extends ComposerContent<TodoListProps, {}> {
    public mixins = [PureRenderMixin];

    static fetch(): Promise<TodoListProps> {
        let promise = new Promise((resolve, reject) => {
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
            <div className='TodoList'>
                <ul style={[todoListStyle.list]}>
                    {this.props.list.map(todo =>{
                        return <TodoListItem key={todo.id} id={todo.id} title={todo.title} description={todo.description}/>
                    })}
                </ul>
            </div>
        );
    }
}

interface TodoStyles extends Radium.Style {
    container: Radium.StyleDeclaration;
}

const todoStyles: TodoStyles = {
    container: {
        width: '400px',
        height: '400px',
        margin: '0 auto',
        backgroundColor: '#999',
    }
}

@Radium
export class Todo extends ComposerContent<TodoItemProps, {}> {
    public mixins = [PureRenderMixin];

    static fetch(): Promise<TodoItemProps> {
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
            <div className='todo' id={`todo-${this.props.id}`} style={[todoStyles.container]}></div>
        );
    }
}
