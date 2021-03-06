import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import { FormGroup, Col, Button } from 'react-bootstrap';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import FontAwesome from 'react-fontawesome';
import ApiWidget from '../../../components/library/ApiWidget';
import { Keys } from './ApisPage_messages';
import { Keys as AppKeys } from '../../../i18n/keys';
import { loadApi, deleteApi } from '../actions';
import * as actions from '../actionTypes';

class ApisListPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      localList: this.props.list
    };

    this.renderList = this.renderList.bind(this);
    this.buildParams = this.buildParams.bind(this);
    this.refresh = this.refresh.bind(this);
    this.deleteApi = this.deleteApi.bind(this);
  }

  componentDidMount() {
    // load default list (i.e. without any parameters)
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    //console.log("New props: ", nextProps.list);
    this.setState({
      localList: nextProps.list
    });
    if (nextProps.currentAction === actions.DELETE_SUCCESS) {
      this.refresh();
    }
  }

  deleteApi(id) {
    this.props.deleteApi(id);
  }

  refresh(params) {
    const queryParams = this.buildParams();
    this.props.loadApi(queryParams);
  }

  buildParams() {
    return null;
  }

  renderList() {
    const listapis = this.state.localList;
    if (listapis && listapis.getList()) {
      // Do not forget to return the list, not only the items inside that list
      return listapis.getList().map((item) => {
        return (
          <div className='apilist-item col-lg-4 col-md-8' key={item.getId()}>
            <ApiWidget
              widgetStyle='info'
              icon='line-chart'
              count={item.getNumberOfUsers()}
              headerText={item.getName()}
              rating={item.getRating()}
              linkTo={'/api/' + item.getId()}
              deleteAction={this.deleteApi}
              id={item.getId()}
              css='default-dark'
            />
          </div>
        );
      });
    }
  }

  getCount() {
    const listapis = this.state.localList;
    if (listapis && listapis.getList() && listapis.getList().length > 0) {
      return (
        <div>
          <span>There {listapis.getList().length > 1 ? 'are' : 'is'} currently </span>
          <span className='teal'>{listapis.getList().length}</span>
          <span> api{listapis.getList().length > 1 ? 's' : ''} available.</span>
        </div>
      );
    }
    return (
      <div>
        No apis are currently available.
      </div>
    );
  }

  render() {
    const transitionOptions = {
      transitionName: "widgetlist",
      transitionEnterTimeout: 700,
      transitionLeaveTimeout: 700
    };
    return (
      <div>
        <div>
          <div className='button-left'>
            <FormGroup>
              <Col>
                <Link to='/newapi'>
                  <Button
                    className='default-submit-button'
                    type='submit'>
                    <FontAwesome name='plus' />
                    <span className="button-text">
                      <FormattedMessage id={Keys.BUTTON_CREATE} />
                    </span>
                  </Button>
                </Link>
              </Col>
            </FormGroup>
          </div>
          <div className='button-right'>
            <Col>
              <Button
                className='default-submit-button'
                type='submit'
                onClick={this.refresh}>
                <FontAwesome name='refresh' />
                <span className="button-text">
                  <FormattedMessage id={AppKeys.VIEWS_QUERY_BUTTONS_REFRESH} />
                </span>
              </Button>
            </Col>
          </div>
        </div>
        <div className="workarea">
          <ReactCSSTransitionGroup {...transitionOptions}>
            {this.renderList()}
          </ReactCSSTransitionGroup>
          <div className='col-lg-12 col-md-8 explore-footer'>
            {this.getCount()}
          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) => {
  return {
    list: state.apis.list,
    isProcessing: state.apis.isProcessing,
    isSuccessful: state.apis.isSuccessful,
    currentAction: state.apis.currentAction,
    errors: state.apis.errors
  }
};

export default connect(mapStateToProps, { loadApi, deleteApi })(injectIntl(ApisListPage));
