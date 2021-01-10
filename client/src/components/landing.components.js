import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cookies from 'universal-cookie';
import getUserToken from '../library/getUserToken';

const Landing = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const token = new cookies().get('token');
        getUserToken(token)
        .then(res => {
            if(res && !res.status){
                const token = new cookies();
                token.set('token', res.token, {path: '/', maxAge: 604800});
                window.location = '/';
            }
        })
    },[]);
    
    const Submit = (e) => {
        e.preventDefault();
        const User = { username, password }
        axios.post('http://localhost:5000/user/login', User)
        .then(res => {
            cookies.save('token', res.data, {path: '/'});
            window.location = '/dashboard';
        })
        .catch(err => this.setState({ msg: "Invalid Credentials" }));
    }
    return (
        <section id="landing">
            <div className="container" style={{ fontFamily:'Itim' }}>
                <div className="row">
                    <div className="col-lg-7 col-md-7 col-sm-12" style={{ marginTop:'35vh' }}>
                        <h1 className="text-center">
                            Welcome to
                            <br/>
                            Todo App MERN
                            <br/>
                        </h1>
                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-12" style={{ margin: '23vh auto 20vh auto' }}>
                        <h2>Login to your Account</h2>
                        <br/><br/>
                        <form onSubmit={Submit}>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fas fa-user"></i></span>
                                </div>
                                <input type="text" className="form-control" onChange={(event) => setUsername(event.target.value)} placeholder="Username" value={username} required/>
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                </div>
                                <input type="password" className="form-control" onChange={(event) => setPassword(event.target.value)} placeholder="Password" value={password} required/>
                            </div>
                            <input type="submit" value="Login" className="btn btn-outline-primary" style={{ width: '100%' }} />
                        </form>
                        <p>Haven't Have an Account? <a href="/register">Register</a></p>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Landing;