import React, { useEffect, useRef } from "react";
import { BiSearchAlt2, BiLeftArrowAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
import { subjectStore } from "../../store/subjectsStore/SubjectStore";
const SearchInput = () => {
  const inputRef = useRef(null);
  const handleSearchTextChange = (text) => {
    subjectStore.setSearchText(text);
  };
  const handleMouseEnter = () => {
    if (subjectStore.mouseHover) {
      subjectStore.mouseHover = false;
    } else {
      subjectStore.mouseHover = true;
    }
  };

  return (
    <>
      <div
        className={`Form-search-bar ${
          subjectStore.mouseHover ? "Set-Form-search-bar" : ""
        }`}
      >
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {!subjectStore.mouseHover ? <BiSearchAlt2 /> : null}
        </div>
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {subjectStore.mouseHover ? <BiLeftArrowAlt /> : null}
        </div>
        <div
          className={`Search-Container ${
            !subjectStore.mouseHover
              ? "Hide-Search-Container"
              : "Show-Search-Container"
          }`}
        >
          <select
            className="Form-search-category"
            value={subjectStore.selectedFilter}
            onChange={(e) => subjectStore.setSelectedFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="subjectName">subject</option>
            <option value="courseCode">courseCode</option>
          </select>

          <input
            type="text"
            className="FormList-text-input"
            placeholder="Search for a subject"
            value={subjectStore.searchText}
            onChange={(e) => {
              subjectStore.setSearchText(e.target.value);
              if (e.target.value === "") {
                subjectStore.fetchData();
              } else {
                subjectStore.handleSearch();
              }
            }}
            ref={inputRef}
          />
          <button
            className="Form-List-search-button"
            onClick={() => {
              handleSearchTextChange("");
              inputRef.current.focus();
              subjectStore.fetchData();
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
              value={subjectStore.rowsPerPage}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (parseInt(value) >= 1 && parseInt(value) <= 50)
                ) {
                  subjectStore.setrowsPerPage(value);
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
