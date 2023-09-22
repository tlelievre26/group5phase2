import subprocess as sp
import json
import os

ESC="\033"
RED=ESC+"[91m"
GREEN=ESC+"[92m"
YELLOW=ESC+"[93m"
BLUE=ESC+"[94m"
RESET=ESC+"[0m"
BOLD=ESC+"[1m"

class CLI_CMD_WRAPPER:
    def __init__(self, command: str):
        self.command = command

    def run(self) -> (bool, str):
        try:
            result = sp.run(self.command, shell=True, check=True, capture_output=True, env=os.environ)

            if result.returncode == 0:
                return True, result.stdout.decode('utf-8')
            else:
                return False, result.stdout.decode('utf-8')
        except sp.CalledProcessError as e:
            return False, e
        except Exception as e:
            return False, e

class MODULE_SCORE:
    def __init__(self, ndjson_str: str):
        self.ndjson_str = ndjson_str
        self.ndjson_obj = json.loads(ndjson_str)
        self.url = self.ndjson_obj['URL']
        self.total_score = self.ndjson_obj['NET_SCORE']
        self.ramp_up_score = self.ndjson_obj['RAMP_UP_SCORE']
        self.correctness_score = self.ndjson_obj['CORRECTNESS_SCORE']
        self.bus_factor_score = self.ndjson_obj['BUS_FACTOR_SCORE']
        self.responsive_maintainer_score = self.ndjson_obj['RESPONSIVE_MAINTAINER_SCORE']
        self.license_score = self.ndjson_obj['LICENSE_SCORE']

    # If any score is outside the range [0,1] then the score is invalid
    def is_valid(self):
        if self.total_score > 1 or self.total_score < 0:
            return False
        
        if self.ramp_up_score > 1 or self.ramp_up_score < 0:
            return False
        
        if self.correctness_score > 1 or self.correctness_score < 0:
            return False
        
        if self.bus_factor_score > 1 or self.bus_factor_score < 0:
            return False
        
        if self.responsive_maintainer_score > 1 or self.responsive_maintainer_score < 0:
            return False
        
        if self.license_score > 1 or self.license_score < 0:
            return False
        
        return True
