import React, { useEffect } from 'react';
import getUserToken from '../library/getUserToken';
import cookies from 'universal-cookie';

/*const Todos = props => (
    <tr>
        <td>{props.todo.description}</td>
        <td>{props.todo.date.substring(0, 10)}</td>
        <td>
            <a href="#" onClick={()=> {props.deleteTodo(props.todo._id)}}><i className="fas fa-trash-alt"></i></a>
        </td>
    </tr>
)*/

const Home = () => {
    /*
    constructor(props){
        super(props);

        this.logout = this.logout.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.deleteTodo = this.deleteTodo.bind(this);

        this.state = {
            username : "",
            todos: [],
        }
    }

    async componentDidMount(){
        if(!check_token){
            window.location = "/";
        }
        const token = cookie.load('token');
        await axios.get('http://localhost:5000/user')
        .then(res => {
            (res.data).forEach(i => {
                if(i.token === token){
                    this.setState({
                        username: i.username
                    })
                }
            })
        })
        var userdata = this.state.username;
        await axios.get('http://localhost:5000/todo/'+userdata)
        .then(res => {
            this.setState({
                todos: res.data
            })
        })
        .catch((err) => {console.log(err)});
    }

    logout(e) {
        cookie.remove('token');
        window.location='/';
    }

    onChangeUsername(e){
        this.setState({
            username: e.target.value
        })
    }
    deleteTodo(id){
        axios.delete('http://localhost:5000/todo/'+id)
        .then(res => { console.log(res.data)} );

        this.setState({
            todos: this.state.todos.filter(el => el._id !== id)
        })
    }
    todoList(){
        console.log(this.state.todos);
        if(this.state.todos){
            return this.state.todos.map(i => {
                return <Todos todo={i} deleteTodo={this.deleteTodo} key={i._id} />; }
            )
        }
    }
    */
    return (
        /*
        <div className="container" style={{ marginTop: '20vh', fontFamily:'Itim' }}>
            <div className="row">
                <h1>Activity List</h1>
                <a href="/add" className="btn btn-outline-primary" style={{ width: '100%', marginBottom: '10px' }}>Add Activity</a>
                <a href="#" onClick={this.logout} className="btn btn-outline-danger" style={{ width: '100%', marginBottom: '10px' }}>Logout</a>
                <table className="table table-stripped">
                    <thead>
                        <tr>
                            <th>Activity Name</th>
                            <th>DueDate</th>
                            <th>Button</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.todoList()}
                    </tbody>
                </table>
            </div>
        </div>
        */
       <div></div>
    );
}

export default Home;