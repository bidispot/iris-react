import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';
import { injectIntl } from 'react-intl';
import { Row } from 'react-bootstrap';
import { Keys } from './SubscriptionsPage_messages';
import Subscription from '../model';
import GenericLayout from '../../../components/library/GenericLayout';
import * as LayoutHelper from '../../../components/library/LayoutHelper';
import SField from '../../../components/library/SField';
import SFieldSelect from '../../../components/library/SFieldSelect';
import { submitNewSubscription, loadSubscription, resetSubscription, updateSubscription, deleteSubscription } from '../actions';
import { loadApi } from '../../apis/actions';
import { load } from '../../apps/actions';

class SubscriptionsCreatePage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isEditEnabled: true,
      isLoadingAsyncContent: false,
      isApisLoaded: false,
      isAppsLoaded: false,
      apis: this.props.apis ? this.props.apis.list : [],
      apps: this.props.apps ? this.props.apps.list : [],
      isDetailPage: this.props.params.id, // needs to parse window location to detect if an id is present, i.e. detail page
      errors: null
    };

    this.getConfig = this.getConfig.bind(this);
    this.toggleEdit = this.toggleEdit.bind(this);
    this.redirectUser = this.redirectUser.bind(this);
    this.onSubscriptionSubmit = this.onSubscriptionSubmit.bind(this);
    this.deleteSubscription = this.deleteSubscription.bind(this);
  }

  getConfig() {
    return ({
      backLabel: Keys.BUTTON_BACK_TO_LIST,
      submitLabel: Keys.BUTTON_SUBMIT,
      isDetailPage: this.state.isDetailPage,
      isEditEnabled: this.state.isEditEnabled,
      remoteProps: this.props,
      errors: this.state.errors,
      onSubmit: this.props.handleSubmit(this.onSubscriptionSubmit),
      backAction: this.redirectUser,
      toggleEditAction: this.toggleEdit,
      deleteAction: this.deleteSubscription
    });
  }

  // setState() does not immediately mutate this.state but creates a pending state transition.
  // Accessing this.state after calling this method can potentially return the existing value.
  // There is no guarantee of synchronous operation of calls to setState and calls may be batched
  // for performance gains.
  componentDidMount() {
    if (this.state.isDetailPage) {
      this.setState({
        isEditEnabled: false,
      });
      // Load content
      this.props.loadSubscription({
        id: this.props.params.id
      });
    } else {
      // Explicitely reset state Subscription values (redux-form only reset initialValues property)
      this.props.resetSubscription();
    }

    if (!this.state.isDetailPage) {
      // Load apis
      this.props.loadApi();
      // Load apps
      this.props.load();
    }

    this.props.reset();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    } else if (nextProps.isUpdateSuccessful || nextProps.isDeleteSuccessful || nextProps.isSubmitSuccessful) {
      this.redirectUser();
    }

    // Dropdowns

    // All APIs and apps
    if (!this.state.isDetailPage) {
      // Get the apis
      if (nextProps && nextProps.apis && nextProps.apis.list) {
        this.setState({
          apis: nextProps.apis.list,
          isApisLoaded: true
        });
      }
      // Get app
      if (nextProps && nextProps.apps && nextProps.apps.list) {
        this.setState({
          apps: nextProps.apps.list,
          isAppsLoaded: true
        });
      }
    }
    // Only lookup current values (detail)
    else {
      // Lookups
      if (nextProps.isLoadSuccessful && !this.state.isLoadingAsyncContent) {
        this.setState({
          isLoadingAsyncContent: true
        });
        // Lookup apis
        this.props.loadApi({
          apis: Object.keys(nextProps.initialValues.getApis())
        });
        // Lookup apps
        this.props.load({
          apps: [nextProps.initialValues.getAppId()]
        });
      } // Get the loaded apis
      if (nextProps.apisIsLoadSuccessful) {
        this.setState({
          apis: nextProps.apis.list,
          isApisLoaded: true
        });
      }
      // Get the loaded apps
      if (nextProps.appsIsLoadSuccessful) {
        this.setState({
          apps: nextProps.apps.list,
          isAppsLoaded: true
        });
      }
      // TODO: Handle errors
      // TODO: Set isLoading to false
    }
  }


  redirectUser() {
    this.props.router.replace('/subscriptionslist');
  }

  onSubscriptionSubmit(newValues) {
    var newSubscription = new Subscription();
    newSubscription = newSubscription
      .setId(newValues.id ? newValues.id : this.props.initialValues.getId())
      .setName(newValues.name ? newValues.name : this.props.initialValues.getName())
      .setDescription(newValues.description ? newValues.description : this.props.initialValues.getDescription())
      .setAppId(newValues.app_id ? newValues.app_id : this.props.initialValues.getAppId())
      .setApis(newValues.apis ? newValues.apis : this.props.initialValues.getApis())
    if (this.state.isDetailPage) {
      return this.props.updateSubscription(newSubscription);
    } else {
      return this.props.submitNewSubscription(newSubscription);
    }
  }

  deleteSubscription() {
    this.props.deleteSubscription(this.props.initialValues);
  }

  toggleEdit() {
    this.setState({
      isEditEnabled: !this.state.isEditEnabled
    });
  }

  renderStatus() {
    if (this.state.isDetailPage) {
      return (
        <Row className="form-group">
          <Field
            type='text'
            name='status'
            label='Status'
            size={8}
            component={SField}
            staticValue={this.props.initialValues.getStatus()}
            disabled
          />
        </Row>
      );
    }
  }

  render() {
    return (
      <GenericLayout config={this.getConfig()}>
        <Row className="form-group">
          <Field
            name='apis'
            label='Apis'
            placeholder='Please your APIs...'
            component={SFieldSelect}
            values={this.state.apis}
            multiple
            size={8}
            isProcessing={!this.state.isApisLoaded || this.props.apisIsProcessing}
            disabled={(this.state.isDetailPage && !this.state.isEditEnabled) || !this.state.apps.length}
          >
            {this.state.apis.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
          </Field>
        </Row>
        <Row className="form-group">
          <Field
            name='apps'
            label='Application'
            placeholder='Select your application...'
            component={SFieldSelect}
            values={this.state.apps}
            size={8}
            isProcessing={this.props.appsIsProcessing}
            disabled={(this.state.isDetailPage && !this.state.isEditEnabled) || !this.state.apps.length}
          >
            {this.state.apps.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
          </Field>
        </Row>
        <Row className="form-group">
          <Field
            type='text'
            name='name'
            label='Name'
            size={8}
            placeholder='e.g. Apis subscription for my project'
            component={SField}
            staticValue={this.props.initialValues.getName()}
            disabled={this.state.isDetailPage && !this.state.isEditEnabled}
          />
        </Row>
        <Row className="form-group">
          <Field
            type='text'
            name='description'
            label='Description'
            size={8}
            placeholder='e.g. Description for your project Apis subscription'
            component={SField}
            staticValue={this.props.initialValues.getDescription()}
            disabled={this.state.isDetailPage && !this.state.isEditEnabled}
          />
        </Row>
        {this.renderStatus()}
        {LayoutHelper.renderActions(this.getConfig())}
      </GenericLayout >
    );
  }

}

const mapStateToProps = (state) => {
  return {
    initialValues: state.subscriptions.subscription,
    isLoadSuccessful: state.subscriptions.isLoadSuccessful,
    isSubmitSuccessful: state.subscriptions.isSubmitSuccessful,
    isUpdateSuccessful: state.subscriptions.isUpdateSuccessful,
    isDeleteSuccessful: state.subscriptions.isDeleteSuccessful,
    apis: state.apis.list,
    apisIsProcessing: state.apis.isProcessing,
    apisIsLoadSuccessful: state.apis.isLoadSuccessful,
    apisErrors: state.apis.errors,
    apps: state.apps.list,
    appsIsProcessing: state.apps.isProcessing,
    appsIsLoadSuccessful: state.apps.isLoadSuccessful,
    appsErrors: state.apps.errors
  }
};

export const SubscriptionsCreateForm = reduxForm({
  form: 'subscriptionForm',
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(SubscriptionsCreatePage);

export default connect(mapStateToProps, { loadApi, load, submitNewSubscription, loadSubscription, resetSubscription, updateSubscription, deleteSubscription })(injectIntl(SubscriptionsCreateForm));
