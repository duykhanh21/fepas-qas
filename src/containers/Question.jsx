import React, { Component } from 'react';
import C from '../constants';
import Firebase from 'firebase';
import store from '../store';
import { connect } from 'react-redux';

const fireRef = new Firebase(C.FIREBASE_URI);

class Question extends Component {
  componentWillMount() {
    const questionId = this.props.params.questionId;
    store.dispatch(this.getQuestionById(questionId));
  }

  getQuestionById(id) {
    return (dispatch) => {
      const fireRefQuestion = fireRef.child('questions');
      const fireRefComment = fireRef.child('comments');
      fireRefQuestion.orderByChild('uid').equalTo(id).once('child_added').then((snap) => {
        const question = snap.val();
        question.comments = [];
        fireRefComment.orderByChild('qid').equalTo(id).on('child_added', (snapshot) => {
          question.comments.push(snapshot.val());
        });
        return dispatch({
          type: C.QUESTION_DETAIL_GET,
          data: question
        });
      });
    };
  }

  render() {
    const question = this.props.question;
    let content;
    if (question.status) {
      const commentView = question.data.comments.map((comment) => {
        return (
          <li key={comment.id}>{comment.content}</li>
        );
      });
      content = (
        <div>
          <p>Title: {question.data.title}</p>
          <p>Content: {question.data.content}</p>
          <p>Tags: {question.data.tags}</p>
          <ul>Comments: {commentView}</ul>
        </div>
      );
    } else {
      content = (
        <p></p>
      );
    }
    return content;
  }
}

const mapStateToProps = (state) => {
  return {
    question: state.question,
  };
};

export default connect(mapStateToProps)(Question);
