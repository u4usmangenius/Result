import React, { useEffect, useRef } from "react";
import { BiSearchAlt2, BiLeftArrowAlt } from "react-icons/bi";
import { observer } from "mobx-react-lite";
import { testStore } from "../../store/TestStore/TestStore";
const SearchInput = () => {
  const inputRef = useRef(null);
  const handleSearchTextChange = (text) => {
    testStore.setSearchText(text);
  };
  const handleMouseEnter = () => {
    if (testStore.mouseHover) {
      testStore.mouseHover = false;
    } else {
      testStore.mouseHover = true;
    }
  };

  return (
    <>
      <div
        className={`Form-search-bar ${
          testStore.mouseHover ? "Set-Form-search-bar" : ""
        }`}
      >
        <div
          className="SearchIcon"
          onClick={handleMouseEnter}
          // onMouseLeave={handleMouseLeave}
        >
          {!testStore.mouseHover ? <BiSearchAlt2 /> : null}
        </div>
        <div className="SearchIcon" onClick={handleMouseEnter}>
          {testStore.mouseHover ? <BiLeftArrowAlt /> : null}
        </div>
        <div
          className={`Search-Container ${
            !testStore.mouseHover
              ? "Hide-Search-Container"
              : "Show-Search-Container"
          }`}
        >
          <select
            className="Form-search-category"
            value={testStore.selectedFilter}
            onChange={(e) => testStore.setSelectedFilter(e.target.value)}
          >
          <option value="all">All</option>
          <option value="TestName">TestName</option>
          <option value="ClassName">ClassName</option>
          <option value="TotalMarks">TotalMarks</option>
          <option value="SubjectName">SubjectName</option>
          </select>

          <input
            type="text"
            className="FormList-text-input"
            placeholder="Search for a test"
            value={testStore.searchText}
            onChange={(e) => {
              testStore.setSearchText(e.target.value);
              if (e.target.value === "") {
                testStore.fetchDataFromBackend(1);
              } else {
                testStore.handleSearch();
              }
            }}
            ref={inputRef}
          />
          <button
            className="Form-List-search-button"
            onClick={() => {
              handleSearchTextChange("");
              inputRef.current.focus();
              testStore.fetchDataFromBackend();
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
              value={testStore.rowsPerPage}
              onChange={(e) => {
                let value = e.target.value;
                if (
                  value === "" ||
                  (parseInt(value) >= 1 && parseInt(value) <= 50)
                ) {
                  testStore.setrowsPerPage(value);
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
