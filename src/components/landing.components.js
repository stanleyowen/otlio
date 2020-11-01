import React, { Component } from 'react';
import axios from 'axios';
import cookie from 'react-cookies';

const token = cookie.load('token');

export default class Landing extends Component {
    async componentDidMount() {
        await axios.get('http://localhost:5000/user')
        .then(res => {
            (res.data).forEach(i=> {
                if(i.token === token){
                    window.location = "/load";
                }
            })
        })
        .catch(err => console.log(err));
    }
    constructor(props) {
        super(props);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            "username" : "",
            "password" : ""
        }
    }
    onChangeUsername(e){
        this.setState({
            username: e.target.value
        });
    }
    onChangePassword(e){
        this.setState({
            password: e.target.value
        });
    }
    onSubmit(e){
        e.preventDefault();
        const User = {
            username: this.state.username,
            password: this.state.password,
        }
        console.log(User);
        axios.post('http://localhost:5000/user/login', User)
        .then(res => {
            cookie.save('token', res.data, {path: '/'});
            window.location = '/';
        })
        .catch(err => console.log(err));
    }
    render() { 
        return (
            <section id="landing">
                <div className="container" style={{ fontFamily:'Itim' }}>
                    <div className="row">
                        <div className="col-lg-7 col-md-7 col-sm-12" style={{ marginTop:'45vh' }}>
                            <h1>
                                Welcome to
                                <br/>
                                Todo App MERN
                                <br/>
                                Author : <a href="http://stanleyowen.atwebpages.com" rel="noreferrer" target="_blank">Stanley Owen</a>
                            </h1>
                        </div>
                        <div className="col-lg-5 col-md-5 col-sm-12" style={{ marginTop: '30vh' }}>
                            <h2>Login to your Account</h2>
                            <br/><br/>
                            <form onSubmit={this.onSubmit}>
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><i className="fas fa-user"></i></span>
                                    </div>
                                    <input type="text" className="form-control" onChange={this.onChangeUsername} placeholder="Username" value={this.state.username} required/>
                                </div>
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                    </div>
                                    <input type="text" className="form-control" onChange={this.onChangePassword} placeholder="Password" value={this.state.password} required/>
                                </div>
                                <input type="submit" className="btn btn-outline-primary" onChange=""style={{ width: '100%' }} />
                            </form>
                            <p>Haven't Have an Account? <a href="/register">Register</a></p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}