# UNIT test

A suite of test functions for developing features.

These tests should work in isolation from the web app and are designed to test the underlying python code.

1. users_test.py
  * sqlite3 manipulation to pickup and assign role
2. volcano_edit_test.py
  1. Create edit entry and assign owner
  2. Notify moderators
  3. Insert modifications
  4. Make log of modifications
  5. Delete edit entry
3. changelog_test.py
  1. create database of database changes: date, who, volcano, changes
4. mapview_test.py
  1. Extract lat lons of volcano
  2. Create map with regions
  3. Display regions
  4. Display Volcanoes on regions
  5. Make click-able!
5. changelog_display_test.py
  1. Pick up volcano from change log
  2. bin by date and assign colour
  3. Display on map illustrating recent changes
