import React, { useEffect, useRef } from "react";
import { resultStore } from "../../store/ResultStore/ResultStore";
import { BiSearchAlt2, BiLeftArrowAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
const SearchInput = () => {
  const inputRef = useRef(null);
  const handleSearchTextChange = (text) => {
    resultStore.setSearchText(text);
  };
  const handleMouseEnter = () => {
    if (resultStore.mouseHover) {
      resultStore.mouseHover = false;
    } else {
      resultStore.mouseHover = true;
    }
  };

  return (
    <>
      <div
        className={`Form-search-bar ${
          resultStore.mouseHover ? "Set-Form-search-bar" : ""
        }`}
      >
        <div
          className="SearchIcon"
          onClick={handleMouseEnter}
          // onMouseLeave={handleMouseLeave}
        >
          {!resultStore.mouseHover ? <BiSearchAlt2 /> : null}
        </div>
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {resultStore.mouseHover ? <BiLeftArrowAlt /> : null}
        </div>
        <div
          className={`Search-Container ${
            !resultStore.mouseHover
              ? "Hide-Search-Container"
              : "Show-Search-Container"
          }`}
        >
          <select
            className="Form-search-category"
            value={resultStore.selectedFilter}
            onChange={(e) => resultStore.setSelectedFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="stdRollNo">RollNo</option>
            <option value="fullName">Name</option>
            <option value="TestName">TestName</option>
            <option value="SubjectName">Subject Name</option>
            <option value="ClassName">Class Name</option>
            <option value="ObtainedMarks">Obtained Marks</option>
            <option value="TotalMarks">Total Marks</option>
          </select>

          <input
            type="text"
            className="FormList-text-input"
            placeholder="Search for a result"
            value={resultStore.searchText}
            onChange={(e) => {
              resultStore.setSearchText(e.target.value);
              if (e.target.value === "") {
                resultStore.fetchDataFromBackend(1);
              } else {
                resultStore.handleSearch();
              }
            }}
            ref={inputRef}
          />
          <button
            className="Form-List-search-button"
            onClick={() => {
              handleSearchTextChange("");
              inputRef.current.focus();
              resultStore.fetchDataFromBackend();
            }}
            ref={inputRef}
          >
            Clear
          </button>
          <div className="Form-List-page-rows">
            <select
              type="text"
              className="Form-search-category"
              placeholder="Enter Rows Per Page"
              value={resultStore.rowsPerPage}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (parseInt(value) >= 1 && parseInt(value) <= 50)
                ) {
                  resultStore.setrowsPerPage(value);
                }
              }}
            >
              <option>2</option>
              <option>5</option>
              <option>10</option>
              <option>20</option>
              <option>30</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default observer(SearchInput);
