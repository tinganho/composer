
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

interface TodoItemStyleComponents extends Radium.Style {
    Container: Radium.StyleDeclaration;
    Title: Radium.StyleDeclaration;
    Description: Radium.StyleDeclaration;
    Link: Radium.StyleDeclaration;
}

const TodoItemStyle: TodoItemStyleComponents = {
    Container: {
        position: 'relative',
        backgroundColor: '#333',
        listStyle: 'none',
        marginBottom: '20px',
        cursor: 'pointer',
        overflow: 'hidden',
    },
    Title: {
        color: '#fff',
        fontFamily: 'Helvetica Neue',
        fontSize: '12px',
    },
    Description: {
        color: '#fff',
        fontFamily: 'Helvetica Neue',
    },
    Link: {
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
            <li style={[TodoItemStyle.Container]}>
                <Link to='/todo' style={[TodoItemStyle.Link]}>
                    <h1 style={[TodoItemStyle.Title]}>{this.props.title}</h1>
                    <p style={[TodoItemStyle.Description]}>{this.props.description}</p>
                </Link>
            </li>
        );
    }
}

interface TodoListProps {
    list: TodoItemProps[];
}

interface TodoListStyleComponents extends Radium.Style {
    List: Radium.StyleDeclaration;
}

const TodoListStyle: TodoListStyleComponents = {
    List: {
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
                <ul style={[TodoListStyle.List]}>
                    {this.props.list.map(todo =>{
                        return <TodoListItem key={todo.id} title={todo.title} description={todo.description}/>
                    })}
                </ul>
            </div>
        );
    }
}

@Radium
export class TodoItem extends ComposerContent<{}, {}> {
    public mixins = [PureRenderMixin];

    public render() {
        return (
            <div className='ajhue'></div>
        );
    }
}