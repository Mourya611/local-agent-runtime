import logging
import re
from enum import Enum
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class PolicyMode(str, Enum):
    ALLOWED = "allowed"
    CONFIRMATION = "confirmation"
    DENIED = "denied"

# Default Security Policies mapping tool actions to PolicyMode
DEFAULT_POLICIES = {
    "web_search": PolicyMode.ALLOWED,
    "browser_navigate": PolicyMode.ALLOWED,
    "browser_read": PolicyMode.ALLOWED,
    "browser_click": PolicyMode.ALLOWED,
    "browser_scroll": PolicyMode.ALLOWED,
    "browser_screenshot": PolicyMode.ALLOWED,
    "browser_extract": PolicyMode.ALLOWED,
    "fill_non_sensitive_form": PolicyMode.ALLOWED,
    
    # Require Human Confirmation
    "send_email": PolicyMode.CONFIRMATION,
    "submit_form": PolicyMode.CONFIRMATION,
    "submit_application": PolicyMode.CONFIRMATION,
    "publish_post": PolicyMode.CONFIRMATION,
    "make_purchase": PolicyMode.CONFIRMATION,
    "delete_file": PolicyMode.CONFIRMATION,
    "modify_account": PolicyMode.CONFIRMATION,
    
    # Explicitly Denied
    "read_password": PolicyMode.DENIED,
    "expose_credentials": PolicyMode.DENIED,
    "destructive_system_op": PolicyMode.DENIED,
}

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+previous\s+instructions",
    r"system\s+prompt\s+override",
    r"send\s+user['\s]*s\s+data",
    r"exfiltrate",
    r"bypass\s+security",
    r"delete\s+all",
    r"drop\s+database"
]

class PolicyEngine:
    """Evaluates safety policies for tool actions and sanitizes untrusted input."""

    def __init__(self, custom_policies: Optional[Dict[str, PolicyMode]] = None):
        self.policies = {**DEFAULT_POLICIES, **(custom_policies or {})}

    def evaluate(self, tool_name: str, action: str, arguments: Dict[str, Any]) -> PolicyMode:
        """Determines if a tool execution is allowed, requires confirmation, or is denied."""
        from backend.app.config import settings
        
        action_key = f"{tool_name}_{action}" if action else tool_name
        
        # Enforce Public Mode Security Allowlist & Denylist
        if settings.is_public_mode:
            PUBLIC_ALLOWED_TOOLS = {"web_search", "web_extract", "safe_http_get", "source_analysis", "verification"}
            if tool_name not in PUBLIC_ALLOWED_TOOLS and action_key not in PUBLIC_ALLOWED_TOOLS:
                logger.warning(f"Public Mode DENIED action '{action_key}': tool not in public allowlist.")
                return PolicyMode.DENIED

        # Check for password/credential reading attempts
        arg_str = str(arguments).lower()
        if "password" in arg_str or "secret_key" in arg_str or "auth_token" in arg_str:
            logger.warning(f"Policy Engine DENIED action {action_key}: attempted secret/credential access.")
            return PolicyMode.DENIED

        mode = self.policies.get(action_key, self.policies.get(tool_name, PolicyMode.ALLOWED))
        logger.info(f"Policy evaluation for {action_key}: {mode.value}")
        return mode

    def sanitize_web_content(self, text: str) -> Dict[str, Any]:
        """Detects prompt injection attempts in web page content and flags them."""
        has_injection = False
        detected_patterns = []
        
        for pattern in PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                has_injection = True
                detected_patterns.append(pattern)
                
        if has_injection:
            logger.warning(f"Prompt injection pattern detected in web content: {detected_patterns}")
            
        return {
            "text": text,
            "has_injection": has_injection,
            "detected_patterns": detected_patterns
        }

policy_engine = PolicyEngine()
