import React, { useEffect, useRef } from "react";
import { BiSearchAlt2, BiLeftArrowAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
import { studentsStore } from "../../store/studentsStore/studentsStore";
const SearchInput = () => {
  const inputRef = useRef(null);
  const handleSearchTextChange = (text) => {
    studentsStore.setSearchText(text);
  };
  const handleMouseEnter = () => {
    if (studentsStore.mouseHover) {
      studentsStore.mouseHover = false;
    } else {
      studentsStore.mouseHover = true;
    }
  };

  return (
    <>
      <div
        className={`Form-search-bar ${
          studentsStore.mouseHover ? "Set-Form-search-bar" : ""
        }`}
      >
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {!studentsStore.mouseHover ? <BiSearchAlt2 /> : null}
        </div>
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {studentsStore.mouseHover ? <BiLeftArrowAlt /> : null}
        </div>
        <div
          className={`Search-Container ${
            !studentsStore.mouseHover
              ? "Hide-Search-Container"
              : "Show-Search-Container"
          }`}
        >
          <select
            className="Form-search-category"
            value={studentsStore.selectedFilter}
            onChange={(e) => studentsStore.setSelectedFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="fullName">Name</option>
            <option value="className">ClassName</option>
            <option value="stdRollNo">RollNo</option>
            <option value="gender">Gender</option>
            <option value="stdPhone">Std.PhoneNo</option>
            <option value="guard_Phone">Guardian PhoneNo</option>
          </select>

          <input
            type="text"
            className="FormList-text-input"
            placeholder="Search for a student"
            value={studentsStore.searchText}
            onChange={(e) => {
              studentsStore.setSearchText(e.target.value);
              if (e.target.value === "") {
                studentsStore.fetchData();
              } else {
                studentsStore.handleSearch();
              }
            }}
            ref={inputRef}
          />
          <button
            className="Form-List-search-button"
            onClick={() => {
              handleSearchTextChange("");
              inputRef.current.focus();
              studentsStore.fetchData();
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
              value={studentsStore.rowsPerPage}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (parseInt(value) >= 1 && parseInt(value) <= 50)
                ) {
                  studentsStore.setrowsPerPage(value);
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
