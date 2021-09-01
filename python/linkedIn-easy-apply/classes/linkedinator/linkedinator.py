from datetime import datetime, timedelta
import re
import pyautogui
import pandas as pd

from bs4 import BeautifulSoup
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager

import time
import random
import os
import csv

from classes.logger.customlogger import ColoredLogger

log = ColoredLogger("log")
driver = webdriver.Chrome(ChromeDriverManager().install())


# def setupLogger():

#     dateAndTime = datetime.strftime(datetime.now(), "%m_%d_%y %H_%M_%S")
#     if not os.path.isdir("./logs"):
#         os.mkdir("./logs")

#     logging.basicConfig(filename=("./logs/" + str(dateAndTime) +
#                         "applyJobs.log"), filemode="w", format='%(asctime)s::%(name)s::%(message)s', datefmt='./logs/%d-%b-%y %H:%M:%S')
#     log.setLevel(logging.DEBUG)
#     streamHandler = logging.StreamHandler()
#     streamHandler.setLevel(logging.DEBUG)
#     streamFormatter = logging.Formatter(
#         '%(asctime)s - %(levelname)s - %(message)s', '%H:%M:%S')
#     streamHandler.setFormatter(streamFormatter)
#     log.addHandler(streamHandler)


class Linkedinator:

    # setupLogger()
    MAX_SEARCH_TIME = 10*60

    def __init__(self,
                 username,
                 password,
                 uploads={},
                 filename='output.csv',
                 blacklist=[]):

        log.info("Hello! I'm the Linkedinator, and I'll try to make your life as easy as possible with everything regarding LinkedIn.\n")
        dirpath = os.getcwd()
        log.info("current directory is : " + dirpath)

        self.uploads = uploads
        past_ids = self.get_appliedIDs(filename)
        self.appliedJobIDs = past_ids if past_ids != None else []
        self.filename = filename
        self.options = self.browser_options()
        self.browser = driver
        self.wait = WebDriverWait(self.browser, 30)
        self.blacklist = blacklist
        self.start_linkedin(username, password)

    def get_appliedIDs(self, filename):
        try:
            df = pd.read_csv(filename,
                             header=None,
                             names=['timestamp', 'jobID', 'job',
                                    'company', 'attempted', 'result'],
                             lineterminator='\n',
                             encoding='utf-8')

            df['timestamp'] = pd.to_datetime(
                df['timestamp'], format="%Y-%m-%d %H:%M:%S.%f")
            df = df[df['timestamp'] > (datetime.now() - timedelta(days=2))]
            jobIDs = list(df.jobID)
            log.info(f"{len(jobIDs)} jobIDs found")
            return jobIDs
        except Exception as e:
            log.info(
                str(e) + "   jobIDs could not be loaded from CSV {}".format(filename))
            return None

    def browser_options(self):
        options = Options()
        options.add_argument("--start-maximized")
        options.add_argument("--ignore-certificate-errors")
        options.add_argument('--no-sandbox')
        options.add_argument("--disable-extensions")

        # Disable webdriver flags or you will be easily detectable
        options.add_argument("--disable-blink-features")
        options.add_argument("--disable-blink-features=AutomationControlled")
        return options

    def start_linkedin(self, username, password):
        log.info("Logging in.....Please wait :)  ")
        self.browser.get(
            "https://www.linkedin.com/login?trk=guest_homepage-basic_nav-header-signin")
        try:
            user_field = self.browser.find_element_by_id("username")
            pw_field = self.browser.find_element_by_id("password")
            login_button = self.browser.find_element_by_css_selector(
                ".btn__primary--large")
            user_field.send_keys(username)
            user_field.send_keys(Keys.TAB)
            time.sleep(1)
            pw_field.send_keys(password)
            time.sleep(1)
            login_button.click()
        except TimeoutException:
            log.info(
                "TimeoutException! Username/password field or login button not found")

    def fill_data(self):
        self.browser.set_window_size(0, 0)
        self.browser.set_window_position(2000, 2000)

    def start_apply(self, positions, locations):
        start = time.time()
        self.fill_data()

        combos = []
        while len(combos) < len(positions) * len(locations):
            position = positions[random.randint(0, len(positions) - 1)]
            location = locations[random.randint(0, len(locations) - 1)]
            combo = (position, location)
            if combo not in combos:
                combos.append(combo)
                log.info(f"Applying to {position}: {location}")
                location = "&location=" + location
                self.applications_loop(position, location)
            if len(combos) > 50:
                break
        self.finish_apply()

    def applications_loop(self, position, location):

        count_application = 0
        count_job = 0
        jobs_per_page = 0
        start_time = time.time()

        log.info("Looking for jobs.. Please wait..")

        self.browser.set_window_position(0, 0)
        self.browser.maximize_window()
        self.browser, _ = self.next_jobs_page(
            position, location, jobs_per_page)
        log.info("Looking for jobs.. Please wait..")

        while time.time() - start_time < self.MAX_SEARCH_TIME:
            log.info(
                f"{(self.MAX_SEARCH_TIME - (time.time() - start_time))//60} minutes left in this search")

            # sleep to make sure everything loads, add random to make us look human.
            randoTime = random.uniform(3.5, 4.9)
            log.debug(f"Sleeping for {round(randoTime, 1)}")
            time.sleep(randoTime)
            self.load_page(sleep=1)

            # get job links
            links = self.browser.find_elements_by_xpath(
                '//div[@data-job-id]'
            )

            if len(links) == 0:
                break

            # get job ID of each job link
            IDs = []
            for link in links:
                children = link.find_elements_by_xpath(
                    './/a[@data-control-name]'
                )
                for child in children:
                    if child.text not in self.blacklist:
                        temp = link.get_attribute("data-job-id")
                        jobID = temp.split(":")[-1]
                        IDs.append(int(jobID))
            IDs = set(IDs)

            # remove already applied jobs
            before = len(IDs)
            jobIDs = [x for x in IDs if x not in self.appliedJobIDs]
            after = len(jobIDs)

            if len(jobIDs) == 0 and len(IDs) > 24:
                jobs_per_page = jobs_per_page + 25
                count_job = 0
                self.avoid_lock()
                self.browser, jobs_per_page = self.next_jobs_page(position,
                                                                  location,
                                                                  jobs_per_page)
            # loop over IDs to apply
            for i, jobID in enumerate(jobIDs):
                count_job += 1
                self.get_job_page(jobID)

                # get easy apply button
                button = self.get_easy_apply_button()
                if button is not False:
                    string_easy = "* has Easy Apply Button"
                    log.info("Clicking the EASY apply button")
                    button.click()
                    time.sleep(3)
                    result = self.send_resume()
                    count_application += 1
                else:
                    log.info("The button does not exist.")
                    string_easy = "* Doesn't have Easy Apply Button"
                    result = False

                position_number = str(count_job + jobs_per_page)
                log.info(
                    f"\nPosition {position_number}:\n {self.browser.title} \n {string_easy} \n")

                self.write_to_file(button, jobID, self.browser.title, result)

                # sleep every 20 applications
                if count_application != 0 and count_application % 20 == 0:
                    sleepTime = random.randint(500, 900)
                    log.info(f"""********count_application: {count_application}************\n\n
								Time for a nap - see you in:{int(sleepTime/60)} min
							****************************************\n\n""")
                    time.sleep(sleepTime)

                # go to new page if all jobs are done
                if count_job == len(jobIDs):
                    jobs_per_page = jobs_per_page + 25
                    count_job = 0
                    log.info("""****************************************\n\n
					Going to next jobs page, YEAAAHHH!!
					****************************************\n\n""")
                    self.avoid_lock()
                    self.browser, jobs_per_page = self.next_jobs_page(position,
                                                                      location,
                                                                      jobs_per_page)
            if len(jobIDs) == 0 or i == (len(jobIDs) - 1):
                break

    def write_to_file(self, button, jobID, browserTitle, result):
        def re_extract(text, pattern):
            target = re.search(pattern, text)
            if target:
                target = target.group(1)
            return target

        timestamp = datetime.now()
        attempted = False if button == False else True
        job = re_extract(browserTitle.split(' | ')[0], r"\(?\d?\)?\s?(\w.*)")
        company = re_extract(browserTitle.split(' | ')[1], r"(\w.*)")

        toWrite = [timestamp, jobID, job, company, attempted, result]
        with open(self.filename, 'a') as f:
            writer = csv.writer(f)
            writer.writerow(toWrite)

    def get_job_page(self, jobID):

        job = 'https://www.linkedin.com/jobs/view/' + str(jobID)
        self.browser.get(job)
        self.job_page = self.load_page(sleep=0.5)
        return self.job_page

    def get_easy_apply_button(self):
        try:
            button = self.browser.find_elements_by_xpath(
                '//button[contains(@class, "jobs-apply")]/span[1]'
            )

            EasyApplyButton = button[0]
        except:
            EasyApplyButton = False

        return EasyApplyButton

    def send_resume(self):
        def is_present(button_locator):
            return len(self.browser.find_elements(button_locator[0],
                                                  button_locator[1])) > 0

        try:
            time.sleep(random.uniform(1.5, 2.5))
            next_locater = (By.CSS_SELECTOR,
                            "button[aria-label='Continue to next step']")
            review_locater = (By.CSS_SELECTOR,
                              "button[aria-label='Review your application']")
            submit_locater = (By.CSS_SELECTOR,
                              "button[aria-label='Submit application']")
            submit_application_locator = (By.CSS_SELECTOR,
                                          "button[aria-label='Submit application']")
            error_locator = (By.CSS_SELECTOR,
                             "p[data-test-form-element-error-message='true']")
            upload_locator = (By.CSS_SELECTOR, "input[name='file']")

            submitted = False
            while True:

                # Upload Cover Letter if possible
                if is_present(upload_locator):

                    input_buttons = self.browser.find_elements(upload_locator[0],
                                                               upload_locator[1])
                    for input_button in input_buttons:
                        parent = input_button.find_element(By.XPATH, "..")
                        sibling = parent.find_element(
                            By.XPATH, "preceding-sibling::*")
                        grandparent = sibling.find_element(By.XPATH, "..")
                        for key in self.uploads.keys():
                            sibling_text = sibling.text
                            gparent_text = grandparent.text
                            if key.lower() in sibling_text.lower() or key in gparent_text.lower():
                                input_button.send_keys(self.uploads[key])

                    # input_button[0].send_keys(self.cover_letter_loctn)
                    time.sleep(random.uniform(4.5, 6.5))

                # Click Next or submitt button if possible
                button = None
                buttons = [next_locater, review_locater,
                           submit_locater, submit_application_locator]
                for i, button_locator in enumerate(buttons):
                    if is_present(button_locator):
                        button = self.wait.until(
                            EC.element_to_be_clickable(button_locator))

                    if is_present(error_locator):
                        for element in self.browser.find_elements(error_locator[0],
                                                                  error_locator[1]):
                            text = element.text
                            if "Please enter a valid answer" in text:
                                button = None
                                break
                    if button:
                        button.click()
                        time.sleep(random.uniform(1.5, 2.5))
                        if i in (2, 3):
                            submitted = True
                        break
                if button == None:
                    log.info("Could not complete submission")
                    break
                elif submitted:
                    log.info("Application Submitted")
                    break

            time.sleep(random.uniform(1.5, 2.5))

        except Exception as e:
            log.info(e)
            log.info("cannot apply to this job")
            raise(e)

        return submitted

    def load_page(self, sleep=1):
        scroll_page = 0
        while scroll_page < 4000:
            self.browser.execute_script(
                "window.scrollTo(0,"+str(scroll_page)+" );")
            scroll_page += 200
            time.sleep(sleep)

        if sleep != 1:
            self.browser.execute_script("window.scrollTo(0,0);")
            time.sleep(sleep * 3)

        page = BeautifulSoup(self.browser.page_source, "lxml")
        return page

    def avoid_lock(self):
        x, _ = pyautogui.position()
        pyautogui.moveTo(x + 200, pyautogui.position().y, duration=1.0)
        pyautogui.moveTo(x, pyautogui.position().y, duration=0.5)
        pyautogui.keyDown('ctrl')
        pyautogui.press('esc')
        pyautogui.keyUp('ctrl')
        time.sleep(0.5)
        pyautogui.press('esc')

    def next_jobs_page(self, position, location, jobs_per_page):
        self.browser.get(
            "https://www.linkedin.com/jobs/search/?f_LF=f_AL&keywords=" +
            position + location + "&start="+str(jobs_per_page))
        self.avoid_lock()
        self.load_page()
        return (self.browser, jobs_per_page)

    def finish_apply(self):
        self.browser.close()
