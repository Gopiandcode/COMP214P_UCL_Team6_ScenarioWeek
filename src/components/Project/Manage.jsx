import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import env from '../../env';
import { Button,  Glyphicon, ListGroup, ListGroupItem, FormControl, FormGroup, ControlLabel, Form, Col, Grid, Row } from 'react-bootstrap';
import { DebounceInput } from 'react-debounce-input';

class Manage extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            id: props.project_id,
            users: [],
            authorized: false,
            errors: [],
            retrievedUsers: []
        };
        this.getusers = this.getusers.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.addUser = this.addUser.bind(this);

        this.handleChange = this.handleChange.bind(this);
    }

    getusers(props) {
        // TOOD: retrieve projects from online
        let new_id = null;

        if (props.project_id) {
            new_id = props.project_id;
        }

        if (props.user && new_id) {
            axios.get(env.root + '/api/project/' + new_id + '/users').then(response => {
                console.log("Launching get users and got this.");
                console.log(response);
                this.setState({
                    users: response.data,
                    id: new_id,
                    authorized: true
                });
            }).catch(err => {
                console.log("Got an error" + err);
                this.setState({
                    users: [],
                    id: new_id,
                    authorized: false
                });
            });
        } else {
            this.setState({
                users: [],
                id: new_id
            });
        }

    }


    handleChange(event) {
        console.log(event);
        if (event.target.value) {
            axios.post(env.root + '/api/user/find', { username: event.target.value }).then(response => {
                if (response.data && !response.data.error) {
                    this.setState({
                        retrievedUsers: response.data,
                        errors: []
                    });
                    this.getusers(this.props);
                } else if (response.data && response.data.error) {
                    this.setState({
                        errors: [JSON.stringify(response.data.eror)]
                    });
                } else {
                    this.setState({
                        errors: ['Unknown error occurred']
                    });
                }
            }).catch(err => {
                this.setState({
                    errors: [JSON.stringify(err)]
                });
            });
        }
    }


    deleteUser(user_id, event) {
        console.log("Delete user called with id " + event);
        console.log(user_id);
        if (this.props.user && this.props.project_id && user_id) {
            console.log("delete user posting to server!");
            axios.delete(env.root + '/api/project/' + this.props.project_id + '/users/' + user_id).then(response => {
                console.log("delete user got back " + response);
                if (response.data && !response.data.error) {
                    this.getusers(this.props);
                }
            }).catch(err => {
                console.log(err);
                this.getusers(this.props);
            });
        }
    }

    addUser(user_id) {
        if (this.props.user && this.props.project_id && user_id) {
            console.log("add user posting to server!");
            axios.post(env.root + '/api/project/' + this.props.project_id + '/users/add', { user_id }).then(response => {
                console.log("Launching add user and got this.");
                console.log('response is ' + response);
                this.getusers(this.props);
            }).catch(err => {
                console.log("Got an error");
                this.setState({
                    errors: [
                        JSON.stringify(err)
                    ]
                })

                this.getusers(this.props);
            });
        } else {
            this.setState({
                errors: [
                ]
            })
        }
    }




    componentDidMount() {
        console.log("Manage-componentDidMount");
        this.getusers(this.props);
    }

    componentWillReceiveProps(props) {
        console.log("Manage-componentWillRecieveProps()");
        this.getusers(props);
    }

    render() {

        console.log("Manage-render()");
        if (this.props.user) {
            // TODO: present retrieved projects if here
            if (this.state.authorized) {
                return (
                    <div className="Home container">
                        <h3>Project team members</h3>
                        <ListGroup>
                            {this.state.users.map(user => {
                                let id = (() => { return user._id })();
                                return (
                                    <ListGroupItem>
                                        <Grid>
                                            <Row>

                                        <Col sm={2} md={2} lg={2}></Col>

                                        <Col sm={8} md={8} lg={8}>
                                            <strong>{user.local.username}</strong>
                                        </Col>
                                        <Col>
                                            <Button bsStyle="danger" onClick={(() => { return () => { this.deleteUser(id); } })()}>
                                                <Glyphicon glyph="remove" /> 
                                        </Button>
                                        </Col>
                                        </Row>
                                        </Grid>
                                    </ListGroupItem>
                                );
                            })}
                        </ListGroup>

                        <Link to={'/project/view/' + this.props.project_id }>
                        <Button>
                            Back
                        </Button>
                        </Link>

                        <h4>Add users</h4>
                        <Form horizontal>
                            <FormGroup>
                                <Col sm={3}>
                                    <ControlLabel>Username</ControlLabel>
                                </Col>
                                {/* <label htmlFor="">Username: </label> */}
                                {/* <DebounceInput minLength={1} debounceTimeout={300} name="" onChange={this.handleChange} /> */}

                                <Col md={5}>
                                    <FormControl componentClass={DebounceInput} minLength={1} debounceTimeout={300} name="" placeholder="Search for a user" onChange={this.handleChange} />
                                </Col>

                            </FormGroup>
                        </Form>

                        {this.state.errors.length !== 0 &&
                            (<div><h4>Errors</h4>
                                <ul style={{ listStyle: 'none' }}>
                                    {this.state.errors.map((err) => (
                                        <li>
                                            <pre>
                                                {JSON.stringify(err)}
                                            </pre>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            )
                        }
                        <ListGroup>
                            {this.state.retrievedUsers.map(user => {
                                let id = (() => { return user._id; })();
                                return (
                                    <ListGroupItem>
                                        <Grid>
                                            <Row>
                                        <Col sm={2} md={2} lg={2}></Col>

                                        <Col sm={8} md={8} lg={8}>

                                        <strong>{user.local.username}</strong>
                                        </Col>
                                        <Col>
                                            <Button style={{
                                            }} bsStyle="success" onClick={(() => { return () => { this.addUser(id); } })()}>
                                                <Glyphicon glyph="plus" />
                                            </Button>
                                            </Col>
                                            </Row>
                                        </Grid>
                                    </ListGroupItem>
                                );
                            }
                            )}
                        </ListGroup>




                    </div>
                );
            } else {
                return (
                    <div className="Project">
                        <h3>Unauthenticated</h3>
                        <p>You are not authenticated to view this page.</p>
                        <Link to="/" >Back</Link>
                    </div>
                )
            }
            // TOOD add functionality to create Project
        } else {
            return (
                <Redirect to={{ pathname: '/' }} />
            );
        }
    }
}


export default Manage;