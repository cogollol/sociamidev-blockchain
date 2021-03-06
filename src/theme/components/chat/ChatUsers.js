import React from 'react';

import ChatUser from './ChatUser';

class ChatUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = { usersWindowOpen: 0, messageIndicatorClass: 'newMessageIndicatorHide' };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lastMessageRec !== nextProps.lastMessageRec) {
      if (this.props.openWindow) {
        this.state.usersWindowOpen = 1;
        this.props.checkUserWin(this.state.usersWindowOpen);
        this.props.onTab(this.props.selectedUser, this.props.selectedUserFullName);
      }
      if (this.state.usersWindowOpen == 0) {
        this.state.messageIndicatorClass = 'newMessageIndicatorShow';
      } else {
        this.state.messageIndicatorClass = 'newMessageIndicatorHide';
      }
    }

    if (this.state.usersWindowOpen == 1) {
      this.state.messageIndicatorClass = 'newMessageIndicatorHide';
    }
  }

  componentDidUpdate() {
    // There is a new message in the state, scroll to bottom of list
    const objDiv = document.getElementById('userList');
    objDiv.scrollTop = objDiv.scrollHeight;
  }

  tabChanges(activeUserID, activeUserFullname) {
    this.props.onTab(activeUserID, activeUserFullname);
  }

  toggleUsersWindow() {
    if (this.state.usersWindowOpen == 1) {
      this.state.usersWindowOpen = 0;
      this.props.checkUserWin(this.state.usersWindowOpen);
    } else if (this.state.usersWindowOpen == 0) {
      this.state.usersWindowOpen = 1;
      this.props.checkUserWin(this.state.usersWindowOpen);
    }
  }

  render() {
    // Loop through all the messages in the state and create a Message component
    var className = 'newMessageIndicator ' + this.state.messageIndicatorClass;
    const classes = `${className}`;
    const users = this.props.users.map((user, i) => {
      const tempLastMessages = this.props.lastMessages;
      var tempLastMessage = '';
      var tempLastMessageTimeStamp = '';
      if (user.userID in tempLastMessages) {
        var message = tempLastMessages[user.userID];
        var tempLastMessage = message.message;
        var tempLastMessageTimeStamp = message.time;
      }
      return (
        <ChatUser
          key={i}
          tabKey={i}
          userID={user.userID}
          username={user.username}
          firstName={user.firstName}
          lastName={user.lastName}
          userType={user.userType}
          profilePic={user.profileImage}
          loggedinStatus={user.loggedinStatus}
          lastMessage={tempLastMessage}
          lastMessageTimeStamp={tempLastMessageTimeStamp}
          lastMessageRec={this.props.lastMessageRec}
          selectedUser={this.props.selectedUser}
          selectedTab={this.state.selectedItem}
          onTab={(activeUserID, activeUserFullname) => this.tabChanges(activeUserID, activeUserFullname)}
          unreadCount={this.props.unreadCount}
        />
      );
    });

    return (
      <div id="userList">
        {users}
      </div>
    );
  }
}

ChatUsers.defaultProps = {
  users: [],
};

export default ChatUsers;
