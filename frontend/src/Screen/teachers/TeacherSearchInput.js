import React, { useEffect, useRef } from "react";
import { BiSearchAlt2, BiLeftArrowAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
import { teachersStore } from "../../store/teachersStore/TeachersStore";
const SearchInput = () => {
  const inputRef = useRef(null);
  const handleSearchTextChange = (text) => {
    teachersStore.setSearchText(text);
  };
  const handleMouseEnter = () => {
    if (teachersStore.mouseHover) {
      teachersStore.mouseHover = false;
    } else {
      teachersStore.mouseHover = true;
    }
  };

  return (
    <>
      <div
        className={`Form-search-bar ${
          teachersStore.mouseHover ? "Set-Form-search-bar" : ""
        }`}
      >
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {!teachersStore.mouseHover ? <BiSearchAlt2 /> : null}
        </div>
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {teachersStore.mouseHover ? <BiLeftArrowAlt /> : null}
        </div>
        <div
          className={`Search-Container ${
            !teachersStore.mouseHover
              ? "Hide-Search-Container"
              : "Show-Search-Container"
          }`}
        >
          <select
            className="Form-search-category"
            value={teachersStore.selectedFilter}
            onChange={(e) => teachersStore.setSelectedFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="fullName">Name</option>
            <option value="subject">Subject</option>
            <option value="gender">Gender</option>
            <option value="phone">Phone Number</option>
          </select>

          <input
            type="text"
            className="FormList-text-input"
            placeholder="Search for a student"
            value={teachersStore.searchText}
            onChange={(e) => {
              teachersStore.setSearchText(e.target.value);
              if (e.target.value === "") {
                teachersStore.fetchData();
              } else {
                teachersStore.handleSearch();
              }
            }}
            ref={inputRef}
          />
          <button
            className="Form-List-search-button"
            onClick={() => {
              handleSearchTextChange("");
              inputRef.current.focus();
              teachersStore.fetchData();
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
              value={teachersStore.rowsPerPage}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (parseInt(value) >= 1 && parseInt(value) <= 50)
                ) {
                  teachersStore.setrowsPerPage(value);
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
