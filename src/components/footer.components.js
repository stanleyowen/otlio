import React, { Component } from 'react';
export default class Footer extends Component {
    render() { 
        return (
            <footer id="footer" className="bg-primary text-white fixed-bottom">
                <p>&copy; 2020 - All Rights Reserved | Created by <a href="http://stanleyowen.atwebpages.com" target="_blank" rel="noreferrer">Stanley Owen</a></p>
            </footer>
        );
    }
}