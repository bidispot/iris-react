import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import PageHeader from '../../../components/library/PageHeader';
import msg, { Keys } from './SubscriptionsPage_messages';
import appMsg, { Keys as AppKeys } from '../../../i18n/keys';

class SubscriptionPage extends Component {

  constructor(props) {
    super(props);
    this.createNewSubscription = this.createNewSubscription.bind(this);
  }

  createNewSubscription() {

  }

  render() {
    return (
      <div className='page-wrapper content'>
        <PageHeader
          title={this.props.intl.formatMessage(msg(Keys.SECTIONS_SUBSCRIPTIONS_TITLE))}
          headerIcon='list'
          rootText={this.props.intl.formatMessage(appMsg(AppKeys.APP_TITLE))} />
        <div className="spacer" />
        {this.props.children}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
  }
};

export default connect(mapStateToProps, {})(injectIntl(SubscriptionPage));
