/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import SidebarItem from "./SidebarItem";
import { useSidebarContext } from "@/context/SidebarProvider";
import { Icon } from "@iconify/react";
import { clsx } from "clsx";
import type { NavItem } from "@/types/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  sidebarVariants,
  contentVariants,
  sectionVariants,
  dropdownVariants,
  overlayVariants,
  chevronVariants,
  logoVariants,
  getNestedStaggeredDelay,
} from "./sidebar-animations";

const Sidebar = () => {
  const pathname = usePathname();
  const {
    setIsOpen,
    isOpen,
    isMobile,
    toggleSidebar,
    animationState,
    transitionSettings,
  } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

    // Uncomment the following line to enable multiple expanded items
    // setExpandedItems((prev) =>
    //   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    // );
  };

  useEffect(() => {
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }

            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 z-40 bg-black/50 h-screen"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={animationState}
        variants={sidebarVariants(isMobile, transitionSettings)}
        className={clsx(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white h-screen",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen"
        )}
        aria-hidden={!isOpen}
      >
        <motion.div
          variants={contentVariants(transitionSettings)}
          className="flex h-full flex-col py-10 pl-[25px] pr-[7px]"
        >
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-2.5 min-[850px]:py-0"
            >
              <motion.div
                className="relative h-8 max-w-[10.847rem]"
                whileHover="hover"
                whileTap="tap"
                variants={logoVariants(transitionSettings)}
              >
                <Image
                  src={"/images/banner.png"}
                  fill
                  sizes="100%"
                  alt="PhantomControl"
                  role="presentation"
                  quality={100}
                />
              </motion.div>
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>
                <Icon icon="mdi:arrow-left" className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {NAV_DATA.map((section, sectionIndex) => (
              <motion.div
                key={section.label}
                className="mb-6"
                variants={sectionVariants(transitionSettings)}
                custom={sectionIndex}
              >
                <motion.h2
                  className="mb-5 text-sm font-medium text-dark-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 * sectionIndex,
                    ...transitionSettings,
                  }}
                >
                  {section.label}
                </motion.h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <motion.li
                        key={item.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: getNestedStaggeredDelay(
                            sectionIndex,
                            itemIndex
                          ),
                          ...transitionSettings,
                        }}
                      >
                        {item.items.length ? (
                          <div>
                            <SidebarItem
                              isActive={item.items.some(
                                ({ url }) => url === pathname
                              )}
                              onClick={() => toggleExpanded(item.title)}
                            >
                              <motion.div
                                initial="collapsed"
                                animate={{
                                  rotate: expandedItems.includes(item.title)
                                    ? [0, 5, 0, -5, 0]
                                    : 0,
                                  scale: expandedItems.includes(item.title)
                                    ? 1.1
                                    : 1,
                                }}
                                transition={{
                                  duration: 0.5,
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 10,
                                }}
                                custom={transitionSettings}
                              >
                                <Icon
                                  icon={item.icon}
                                  className="size-6 shrink-0"
                                  aria-hidden="true"
                                />
                              </motion.div>

                              <span>{item.title}</span>

                              <motion.div
                                animate={
                                  expandedItems.includes(item.title)
                                    ? "open"
                                    : "closed"
                                }
                                variants={chevronVariants(transitionSettings)}
                              >
                                <Icon
                                  icon="mdi:chevron-up"
                                  className="ml-auto"
                                  aria-hidden="true"
                                />
                              </motion.div>
                            </SidebarItem>

                            <AnimatePresence>
                              {expandedItems.includes(item.title) && (
                                <motion.ul
                                  initial="closed"
                                  animate="open"
                                  exit="closed"
                                  variants={dropdownVariants(
                                    transitionSettings
                                  )}
                                  className="ml-9 mr-0 space-y-1.5 overflow-hidden pr-0 pt-2"
                                  role="menu"
                                >
                                  {item.items.map((subItem, subIndex) => (
                                    <motion.li
                                      key={subItem.title}
                                      role="none"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                        transition: {
                                          delay: 0.05 * subIndex,
                                          ...transitionSettings,
                                        },
                                      }}
                                    >
                                      <SidebarItem
                                        as="link"
                                        href={subItem.url}
                                        isActive={pathname === subItem.url}
                                      >
                                        <span>{subItem.title}</span>
                                      </SidebarItem>
                                    </motion.li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          (() => {
                            const href = (item as NavItem).url
                              ? (item as NavItem).url
                              : "/" +
                                (item as NavItem).title
                                  .toLowerCase()
                                  .split(" ")
                                  .join("-");

                            return (
                              <SidebarItem
                                className="flex items-center gap-3 py-3"
                                as="link"
                                href={href}
                                isActive={pathname === href}
                              >
                                <motion.div
                                  whileHover={{
                                    rotate: [0, 5, 0, -5, 0],
                                    transition: {
                                      duration: 0.5,
                                      repeat: Number.POSITIVE_INFINITY,
                                      repeatType: "loop",
                                    },
                                  }}
                                >
                                  <Icon
                                    icon={item.icon}
                                    className="size-6 shrink-0"
                                    aria-hidden="true"
                                  />
                                </motion.div>

                                <span>{item.title}</span>
                              </SidebarItem>
                            );
                          })()
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </nav>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
