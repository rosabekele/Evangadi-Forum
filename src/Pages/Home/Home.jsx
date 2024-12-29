import React, { useState, useEffect } from "react";
import classes from "./Home.module.css";
import { Link, useNavigate } from "react-router-dom";
import { IoChevronForwardCircleSharp } from "react-icons/io5";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import axios from "../../API/axios";
// react-redux
import { connect } from "react-redux";
// actions creation function
import { storeUser } from "../../Utility/action";
import { toast } from "react-toastify";
import { FaUserTie } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";

const Home = ({ user, storeUser }) => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Check if the user is logged in
  const checkUserLogged = async () => {
    try {
      const { data } = await axios.get("/user/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      storeUser(data?.userName);
      await fetchAllQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch all questions
  const fetchAllQuestions = async () => {
    try {
      const { data } = await axios.get("/question", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!data || data.length === 0) {
        setQuestions([]);
        toast.error("No questions found", {
          position: "top-center",
        });
      }
      setQuestions(data.data.reverse());
    } catch (error) {
      toast.error(
        `Error: ${error.response?.data?.message || "Fetching questions error"}`,
        {
          position: "top-center",
        }
      );
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      checkUserLogged();
    } else {
      navigate("/");
      toast.error("Please create an account or log in first!", {
        position: "top-center",
      });
    }
  }, []);

  // Calculate total pages
  const totalPages =
    questions.length % questionsPerPage === 0
      ? questions.length / questionsPerPage
      : Math.floor(questions.length / questionsPerPage) + 1;

  // Pagination logic
  const lastQuestion = currentPage * questionsPerPage;
  const firstQuestion = lastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(
    firstQuestion,
    lastQuestion
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className={classes.home__container}>
      <div className={classes.home__wrapper}>
        <div className={classes.home__header}>
          <Link to="/question">
            <button>Ask Question</button>
          </Link>

          <h4>
            Welcome: <span>{user}</span>
          </h4>
        </div>
        <div className={classes.home_search_question}>
          <input placeholder="Search question" />
        </div>
        {loading ? (
          <p>Loading questions...</p>
        ):currentQuestions.map((singleQuestion, i) => (
          <Link
            key={i}
            className={classes.question__container}
            to={`/answer/${singleQuestion?.questionId}`}
          >
            <hr />
            <div className={classes.question__wrapper}>
              <div className={classes.question__left}>
                <div className={classes.question__img}>
                  <FaUserTie size={35} />
                </div>
                <h6>{singleQuestion?.userName}</h6>
              </div>
              <div className={classes.question__middle}>
                <h6>{singleQuestion?.title}</h6>
              </div>
              <div className={classes.question__right}>
                <FaAngleRight size={30} />
              </div>
            </div>
          </Link>
        ))}
        <div className={classes.pagination}>
          <button onClick={handlePreviousPage} disabled={currentPage === 1} 
          className={classes.pagination__button}>
            <IoChevronBackCircleSharp size={25}/>
          </button>
          <span>
          {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={classes.pagination__button}
          >
            <IoChevronForwardCircleSharp size={25}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    storeUser: (users) => dispatch(storeUser(users)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
