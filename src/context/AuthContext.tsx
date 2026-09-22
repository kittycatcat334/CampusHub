import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Institution } from '../types';
import { db, DEFAULT_USERS, DEFAULT_INSTITUTIONS, initDatabase, subscribeToDB } from '../services/db';

interface AuthContextType {
  currentUser: User;
  isAuthenticated: boolean;
  allUsers: User[];
  isTeacher: boolean;
  isStudent: boolean;
  isAdmin: boolean;
  isPrincipal: boolean;
  // Multi-tenancy & Institution Selling Platform
  institutions: Institution[];
  currentInstitution: Institution;
  switchInstitution: (institutionId: string) => Institution;
  createInstitution: (data: Omit<Institution, 'id' | 'createdAt'> & { adminPassword?: string }) => { institution: Institution; adminUser: User };
  updateInstitution: (institutionId: string, updates: Partial<Institution>) => Institution;
  deleteInstitution: (institutionId: string) => boolean;
  // Verification code
  staffVerificationCode: string;
  updateStaffVerificationCode: (code: string) => string;
  verifyStaffCode: (code?: string) => boolean;
  login: (email: string, password: string, portalRole?: UserRole, svCode?: string) => { success: boolean; error?: string };
  loginAsUser: (user: User) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<User>) => void;
  signInWithGooglePlaceholder: () => Promise<void>;
  createCustomAccount: (name: string, email: string, role: UserRole, department: string, password?: string, svCode?: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'campushub_current_user_id';
const AUTH_ACTIVE_KEY = 'campushub_auth_active';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    initDatabase();
    return localStorage.getItem(AUTH_ACTIVE_KEY) === 'true';
  });

  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    initDatabase();
    return db.getInstitutions();
  });

  const [currentInstitution, setCurrentInstitutionState] = useState<Institution>(() => {
    initDatabase();
    return db.getCurrentInstitution();
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    initDatabase();
    const storedId = localStorage.getItem(CURRENT_USER_KEY);
    const users = db.getUsers();
    if (storedId) {
      const match = users.find(u => u.id === storedId);
      if (match) return match;
    }
    // Default to first user if already authenticated or seeded
    return users[0] || DEFAULT_USERS[0];
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => db.getUsers());
  const [staffVerificationCode, setStaffVerificationCodeState] = useState<string>(() => db.getStaffVerificationCode());

  useEffect(() => {
    const unsubscribe = subscribeToDB(() => {
      setAllUsers(db.getUsers());
      setInstitutions(db.getInstitutions());
      setCurrentInstitutionState(db.getCurrentInstitution());
      setStaffVerificationCodeState(db.getStaffVerificationCode());
    });
    return unsubscribe;
  }, []);

  const switchInstitution = (institutionId: string): Institution => {
    const updated = db.setCurrentInstitution(institutionId);
    setCurrentInstitutionState(updated);
    setInstitutions(db.getInstitutions());
    setStaffVerificationCodeState(db.getStaffVerificationCode());
    return updated;
  };

  const createInstitution = (data: Omit<Institution, 'id' | 'createdAt'> & { adminPassword?: string }) => {
    const res = db.createInstitution(data);
    setInstitutions(db.getInstitutions());
    setAllUsers(db.getUsers());
    return res;
  };

  const updateInstitution = (institutionId: string, updates: Partial<Institution>) => {
    const updated = db.updateInstitution(institutionId, updates);
    setInstitutions(db.getInstitutions());
    if (updated.id === currentInstitution.id) {
      setCurrentInstitutionState(updated);
    }
    return updated;
  };

  const deleteInstitution = (institutionId: string) => {
    const res = db.deleteInstitution(institutionId);
    setInstitutions(db.getInstitutions());
    setCurrentInstitutionState(db.getCurrentInstitution());
    return res;
  };

  const updateStaffVerificationCode = (newCode: string): string => {
    const clean = db.setStaffVerificationCode(newCode);
    setStaffVerificationCodeState(clean);
    return clean;
  };

  const verifyStaffCode = (code?: string): boolean => {
    return db.verifyStaffCode(code);
  };

  const login = (email: string, password: string, portalRole?: UserRole, svCode?: string) => {
    const result = db.authenticateUser(email, password, portalRole, svCode);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem(CURRENT_USER_KEY, result.user.id);
      localStorage.setItem(AUTH_ACTIVE_KEY, 'true');
      return { success: true };
    }
    return { success: false, error: result.error || 'Authentication failed' };
  };

  const loginAsUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    localStorage.setItem(AUTH_ACTIVE_KEY, 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_ACTIVE_KEY);
  };

  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(CURRENT_USER_KEY, target.id);
    }
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    if (currentUser.role === newRole) return;
    const target = allUsers.find(u => u.role === newRole);
    if (target) {
      switchUser(target.id);
    } else {
      // Toggle current user role
      const updated = db.updateUserProfile(currentUser.id, { role: newRole });
      setCurrentUser(updated);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = db.updateUserProfile(currentUser.id, updates);
    setCurrentUser(updated);
    setAllUsers(db.getUsers());
  };

  // Google OAuth Architectural Adapter
  // Pluggable method designed for Google Identity Services / GSI initTokenClient or Firebase Auth
  const signInWithGooglePlaceholder = async () => {
    console.info('[CampusHub Auth] Google OAuth adapter hook invoked. Architecture prepared for Google Identity Services.');
    // Future integration point:
    // const client = google.accounts.oauth2.initTokenClient({...})
  };

  const createCustomAccount = (
    name: string,
    email: string,
    role: UserRole,
    department: string,
    password?: string,
    svCode?: string
  ): { success: boolean; error?: string } => {
    if (role === 'teacher') {
      if (!svCode || !verifyStaffCode(svCode)) {
        return {
          success: false,
          error: 'Valid Staff Verification Code (SV-Code) required to register a faculty account.'
        };
      }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password?.trim() || (role === 'teacher' ? 'faculty123' : 'student123'),
      role,
      department,
      studentId: role === 'student' ? `STU-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      facultyId: role === 'teacher' ? `FAC-${Math.floor(100 + Math.random() * 900)}` : undefined,
      title: role === 'teacher' ? 'Faculty Instructor' : undefined
    };

    const users = db.getUsers();
    users.push(newUser);
    localStorage.setItem('campushub_users_v2', JSON.stringify(users));
    setAllUsers(users);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    localStorage.setItem(AUTH_ACTIVE_KEY, 'true');
    return { success: true };
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    allUsers,
    isTeacher: currentUser?.role === 'teacher',
    isStudent: currentUser?.role === 'student',
    isAdmin: currentUser?.role === 'admin',
    isPrincipal: currentUser?.role === 'principal',
    institutions,
    currentInstitution,
    switchInstitution,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    staffVerificationCode,
    updateStaffVerificationCode,
    verifyStaffCode,
    login,
    loginAsUser,
    logout,
    switchUser,
    switchRole,
    updateProfile,
    signInWithGooglePlaceholder,
    createCustomAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
