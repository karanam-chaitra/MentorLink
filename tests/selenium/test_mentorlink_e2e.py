import os
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options


class ProfilePage:
    def __init__(self, driver):
        self.driver = driver

    def open(self, url):
        self.driver.get(url)

    def create_student_profile(self, name, email, interests, goals):
        self.driver.find_element(By.ID, "student-name").send_keys(name)
        self.driver.find_element(By.ID, "student-email").send_keys(email)
        self.driver.find_element(By.ID, "student-interests").send_keys(interests)
        self.driver.find_element(By.ID, "student-goals").send_keys(goals)
        self.driver.find_element(By.ID, "create-profile-btn").click()

    def get_status(self):
        return self.driver.find_element(By.ID, "status-message").text


@pytest.mark.skipif(os.getenv("RUN_E2E") != "1", reason="Set RUN_E2E=1 with running app to execute Selenium")
def test_student_profile_creation_journey():
    opts = Options()
    opts.add_argument("--headless")
    driver = webdriver.Chrome(options=opts)
    try:
        page = ProfilePage(driver)
        page.open("http://localhost:3000")
        page.create_student_profile("Riya", "riya@college.edu", "ML, Python", "Prepare for summer research")
        assert "Profile created" in page.get_status()
    finally:
        driver.quit()
