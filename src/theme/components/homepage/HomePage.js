/*
    author: Alexander Zolotov
*/

import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {Icon} from 'react-fa'
import Async from 'async';
import Countdown from 'react-countdown-now';

import ActionLink from '~/src/components/common/ActionLink'
import DetailsPopup from '~/src/theme/components/DetailsPopupLatestTask';

import ProgressionTreesLanding from '~/src/theme/ProgressionTreesLanding';

import SkillCard from "~/src/theme/components/progressiontrees/SkillCard"

import {
  setSearchQuery,
} from '~/src/redux/actions/fetchResults'

import {
  fetchRoadmaps,
  fetchRoadmapsFromAdmin,
} from '~/src/redux/actions/roadmaps'

import {
  prepareTimers,
  showAllTimers,
  showTopTimers
} from '~/src/redux/actions/timers'

const MAX_LATEST_TASKS = 3;
const TaskTypesToNameMap = {find_mentor: "Find Mentor",};

import "~/src/theme/css/homePage.css"

class HomePage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isDetailsOpen: false,
      currentTask: {}
    }
  }

  componentWillMount() {
    this.props.onFetchAllTasks(false);
    this.props.fetchRoadmaps();
    this.props.fetchRoadmapsFromAdmin(this.props.isAuthorized ? this.props.userProfile._id : undefined);
    this.props.prepareTimers(this.props.userProfile.progressionTrees, this.props.userProfile._id);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isAuthorized != this.props.isAuthorized) {
      if (this.props.isAuthorized) {
        this.props.fetchRoadmapsFromAdmin(this.props.userProfile._id);
      }
    }
  }

  handleCloseModal() {
    let copy = Object.assign({}, this.state, {isDetailsOpen: false});
    this.setState(copy);
  }

  handleOpenModal(task) {
    let copy = Object.assign({}, this.state, {isDetailsOpen: true, currentTask: task});
    this.setState(copy);
  }

  handleStartSearch(e) {
    e.preventDefault();
    this.props.onHandleStartSearch();
  }

  HandleChange(e) {
    this.props.setSearchQuery(e.target.value);
  }

  onViewTaskAuthor(task) {
    this.handleOpenModal(task);  
  }

  renderTask(task) {
    return (
      <h5>{task.name}</h5>
    );
  }

  taskTypeToName(taskType) {
    return TaskTypesToNameMap[taskType];
  }

  renderLatestTasks() {
    let that = this;

    let publishedTasks = [];
    
    publishedTasks = this.props.tasks.filter(function(task) {
      return !task.isHidden;
    });
    
    let latestTasks = publishedTasks.slice(0).sort(function(a, b) {
      return b.creationDate - a.creationDate;
    });

    return (
      <div className="row">
        {
          latestTasks.map(function(task, i) {
            if (i < MAX_LATEST_TASKS) {
              return (<div className="col-lg-4" key={i}>
              <ActionLink href='#' className="latest-task-tile" onClick={()=> that.onViewTaskAuthor(task)}>
                <div>
                <p>{that.taskTypeToName(task.type)}</p>
                  <p >{task.roadmapName ? task.roadmapName : task.name}</p>
                </div>
              </ActionLink>
            </div>);
            }
            else {
              return null;
            }
          })
        }
      </div>
    );
  }

  renderTasks() {
    console.log("renderTasks this.props.tasks: " + this.props.tasks.length);
    if (this.props.tasks.length > 0) {
      const LatestTasks = this.renderLatestTasks();
      return (
        this.renderLatestTasks()
      );
    }
    else {
      return null;
    }
  }

  renderSearhForm() {
    const waitingText = (this.props.isFetchInProgress) ? <b>(Wait...)</b> : "";
    
    const TextInput = this.props.isFetchInProgress ? <h6>Searching...</h6> 
    : (
        <input type="text" id="search-query" name="query" autoComplete="off"
            placeholder="Key in a job or a skill you are exploring" 
              onChange={(e) => this.HandleChange(e)} autoFocus/>
    );

    return (
      <form className="form-inline" action="#" onSubmit={(e) => this.handleStartSearch(e)}>
        <div className="form-group">
          {TextInput}
        </div>
      </form>
    );
  }

  renderTimers() {
    if (this.props.timers.isTimersInProgress === false) {
      let timersCount = _.get(this.props.timers,'data.length', 0);
      if ( timersCount > 0 ){
        let showFilter = undefined;
        if( this.props.timers.showMoreFilter ) {
          showFilter = this.props.timers.displayAll ?  
          <a onClick={()=> this.props.showTopTimers()} className="show-more">Show less</a> 
          :  <a onClick={()=> this.props.showAllTimers()} className="show-more">Show more</a>
        }        
        return (
          <div>
            { 
              this.props.userProfile.progressionTrees.length > 0 && 
              this.props.timers.data.slice(0,this.props.timers.showIndex).map((item,index) => {
                return <p key={index} className="skill-in-progress">
                          <span>{item.name}</span>
                          (<Countdown daysInHours={false} date={item.date} />)
                        </p>    
              })
            }
            { showFilter }
          </div>
        );
      } else {
        return <span>No Active Timers</span>;
      }
    } else {
      return (
        <div>
          Loading Timers...<Icon spin name="spinner" />
        </div>
      );
    }
  }

  renderUserProgressionTrees(){
    return (
        <div className="progression-tree-skill-list">
              { 
                this.props.roadmapsAdmin.data.length != 0 && 
                this.props.roadmapsAdmin.data.map((item,index) => {
                  return <SkillCard key={index} skillItem={item} />
                })
              }
      </div>
      )
    }

  render() {
    //const SearchForm = this.renderSearhForm();
    const Tasks = this.renderTasks();
    return (
      // <div className="row">
      // <div className="col-lg-12">
      // <div id="main-content_1">
      //   <div id="wrapper-home-page">
        
      //     {this.state.isDetailsOpen ? <DetailsPopup modalIsOpen={this.state.isDetailsOpen} 
      //       onCloseModal={()=>this.handleCloseModal()} task={this.state.currentTask}/> : null}
      //       <div className="container">
      //         <div className="row">
      //           <div className="col-lg-12">
      //             <div>
      //                {this.props.isFetchInProgress ? <h1>Searching... <Icon spin name="spinner"/></h1> : <h1>What should I learn next</h1>}
      //               <p>Soqqle helps you develop your learning map, connect with friends and earn by sharing your knowledge and experience</p>
      //             </div>
      //         </div>
      //         <div className="row">
      //           <div className="col-lg-6">
      //             {/* <ProgressionTreesLanding /> */}
      //           </div>
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // </div>
      // </div>
      // </div>
      <div className="progressiontree-container">
            <div className="row progression-tree-header-box">
                <div className="progressiontree-header"><b>My progression skills</b></div>
                <div className="progression-tree-timers">
                  <div className="progression-tree-clock">Innovation - Illuminate (00:25:12:59)</div>
                </div>
                <a className="show-more-option">show more</a>
            </div>
            <div className="progression-tree-panels row">
                {this.renderUserProgressionTrees()}    
            </div>
        </div>
    );
  }
}

HomePage.propTypes = {
  isFetchInProgress: PropTypes.bool.isRequired,
  tasks: PropTypes.array.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  roadmapsAdmin: PropTypes.object.isRequired,
}

const mapDispatchToProps = dispatch => ({
  setSearchQuery: bindActionCreators(setSearchQuery, dispatch),
  fetchRoadmaps: bindActionCreators(fetchRoadmaps, dispatch),
  fetchRoadmapsFromAdmin: bindActionCreators(fetchRoadmapsFromAdmin, dispatch),
  prepareTimers: bindActionCreators(prepareTimers, dispatch),
  showAllTimers: bindActionCreators(showAllTimers, dispatch),
  showTopTimers: bindActionCreators(showTopTimers, dispatch)
})

const mapStateToProps = state => ({
  isFetchInProgress: state.isFetchInProgress,
  tasks: state.tasks.data,
  roadmapsAdmin: state.roadmapsAdmin,
  timers: state.timers
})

//withRouter - is a workaround for problem of shouldComponentUpdate when using react-router-v4 with redux
export default connect(mapStateToProps, mapDispatchToProps)(HomePage);