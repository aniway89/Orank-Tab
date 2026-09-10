// import React from 'react'
import './App.css';

function App() {
  return (
    <div className="container flex">
        <div className="browser-contaier flex-col ac">
            <div className="time-and-date flex-col as">
                <div className="date">7 Sept</div>
                <div className="Time flex ac">
                    12:20 AM
                </div>
            </div>
            <div className="Searchbar flex ac">
                <div className="icon"><i className="bi bi-search"></i></div> 
                <input type="search" name="" id="" placeholder='Search' className='Searchabr'/>
            </div>
            <div className="news flex-col as">
                <h2 className="title">
                    Today's Founds
                </h2>
                <div className="flex ac">
                    <div className="Nasa-news-card flex-col as">
                        <img src="" alt="" className="nasa-news-img" />
                        <h4 className="news-title">we discover alien.</h4>
                        <div className="news-context">Here are all other info</div>
                    </div>

                    <div className="Nasa-news-card flex-col as">
                        <img src="" alt="" className="nasa-news-img" />
                        <h4 className="news-title">we discover alien.</h4>
                        <div className="news-context">Here are all other info</div>
                    </div>

                </div>
            </div>
        </div>
        <div className="functionable-bar flex-col ac">
            <div className="shortcuttab">
                <div className="flex ac bb">Shortcut <div className="EDIT btn"><i className="bi bi-pen"></i></div> <div className="Add btn"><i className="bi bi-plus-lg"></i></div></div>
                <div className="shortcut-container flex warp">
                    <a href="" className="shortcut">
                        <img src="" alt="" className="shortcut-img" />
                    </a>
                </div>
            </div>
            <div className="to-do-contaier">
                <div className="flex ac bb "><i className="bi bi-list-ul"></i> Todo list</div>
                <div className="add-todo flex ac">
                    <i className="bi bi-plus-lg border-dd"></i> <input type="text" name="" id="" className='Add-todo' />
                </div>
                <div className="todo-list flex ac cb">
                    <input type="checkbox" name="" id="" className='checkbox' /> <div className="taskti">Dam task</div><div className="delete"> <i className="bi bi-x"></i></div>
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default App