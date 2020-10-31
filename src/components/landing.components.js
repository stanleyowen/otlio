import React, { Component } from 'react';

export default class Landing extends Component {
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
                                Author : <a href="http://stanleyowen.atwebpages.com" target="_blank">Stanley Owen</a>
                            </h1>
                        </div>
                        <div className="col-lg-5 col-md-5 col-sm-12" style={{ marginTop: '30vh' }}>
                            <h2>Login to your Account</h2>
                            <br/><br/>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fas fa-user"></i></span>
                                </div>
                                <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" style={{ width:'40%' }} />
                            </div>
                            <div className="input-group mb-3">
                                <div className="input-group-prepend">
                                    <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                </div>
                                <input type="text" className="form-control" placeholder="Password" aria-label="Password" aria-describedby="basic-addon1" />
                            </div>
                            <input type="submit" className="btn btn-outline-primary" style={{ width: '100%' }} />
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}