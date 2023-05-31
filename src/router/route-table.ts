const routeTableNotLoggedIn = [
  {
    path: "/home",
    children: [
      {
        path: "/resetPwd",
        children: [],
      },
      {
        path: "/faq",
        children: [],
      },
    ],
  },
];

const routeTableLoggedIn = [
  {
    path: "/home",
    children: [
      {
        path: "/profile/online",
        children: [
          {
            path: "/lpSearch/online",
            children: [
              {
                path: "/scan",
                children: [],
              },
            ],
          },
        ],
      },
      {
        path: "/profile/offline",
        children: [
          {
            path: "/lpSearch/offline",
            children: [],
          },
        ],
      },
      {
        path: "/profileManagement",
        children: [],
      },
      // TODO data management query info need to be updated
      // {
      //   path: "/DataMgmtList",
      //   children: [
      //     {
      //       path: "/dataMgmtGD",
      //       children: [
      //         {
      //           path: "/dataMgmtGDEdit",
      //           children: [
      //             {
      //               path: "/dataManagementMixCartonList",
      //               children: [
      //                 { path: "/dataManagementMixCarton", children: [] },
      //               ],
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // },
      {
        path: "/dataMgmtList",
        children: [
          {
            path: "/dataMgmtDetail",
            query: {
              from: "true",
            },
            children: [
              {
                path: "/dataMgmtCartonList",
                children: [
                  {
                    path: "/dataMgmtCartonDetail",
                    query: {
                      from: "true",
                    },
                    children: [
                      {
                        path: "/dataMgmtMixCartonList",
                        children: [
                          {
                            path: "/dataMgmtMixCartonDetail",
                            query: {
                              from: "true",
                            },
                          },
                          {
                            path: "/dataMgmtMixCarton",
                            query: {
                              from: "true",
                            },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/setting",
        query: {
          leftDrawerOpen: "true",
        },
        children: [
          {
            path: "/setting-language",
            children: [],
          },
          {
            path: "/setting-ring-voice",
            children: [],
          },
          {
            path: "/setting-scan-device",
            children: [],
          },
          {
            path: "/software-update",
            children: [],
          },
          {
            path: "/resetPwd",
            children: [],
          },
        ],
      },
      {
        path: "/lpList",
        children: [{ path: "/lpDetailList", children: [] }],
      },
      {
        path: "/cargoImageList",
        children: [
          {
            path: "/cargoImage",
            children: [],
          },
        ],
      },
      {
        path: "/continueJobs",
        children: [],
      },
      {
        path: "/resetPwdHome",
        children: [],
      },
    ],
  },
  {
    path: "/mixCarton",
  },
  {
    path: "/cartonDetail",
  },
];

const searchRoute: any = (
  item: any,
  matching: string,
  parentNode: any = null
) => {
  if (item.path == matching) {
    return { matched: item, parent: parentNode };
  } else if (item.children && item.children.length > 0) {
    let i;
    let result = null;
    for (i = 0; result == null && i < item.children.length; i++) {
      result = searchRoute(item.children[i], matching, item);
    }
    return result;
  }
  return null;
};

export { routeTableLoggedIn, routeTableNotLoggedIn, searchRoute };
